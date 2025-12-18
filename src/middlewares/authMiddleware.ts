import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../libs/prisma";
import { ResponseData } from "../utils/Response";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ResponseData.unauthorized(res, "token tidak ditemukan");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      tokenId: string;
    };

    // cek apakah tokenId masih ada (belum logout)
    const tokenExists = await prisma.accessToken.findUnique({
      where: { tokenId: decoded.tokenId },
    });

    if (!tokenExists) {
      return ResponseData.forbidden(
        res,
        "token sudah tidak valid (sudah logout)"
      );
    }

    // ambil data user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });

    if (!user) {
      return ResponseData.notFound(res, "user tidak ditemukan");
    }

    (req as any).user = user;
    return next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return ResponseData.unauthorized(
        res,
        "token expired, silakan login kembali"
      );
    }

    return ResponseData.forbidden(res, "token tidak valid");
  }
};