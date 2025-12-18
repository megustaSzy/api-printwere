import prisma from "../libs/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4, validate } from "uuid";
import { createError } from "../utils/createError";
import { AuthData } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const authService = {
  async registerUser(data: AuthData, createRole?: "Admin" | "User") {
    const roleSave =
      data.role === "Admin" && createRole === "Admin" ? "Admin" : "User";
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) throw createError("email sudah digunakan", 409);

    const hash = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hash,
        role: roleSave,
        notelp: data.notelp || "",
      },
    });
  },

  async createTokens(userId: number) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
      },
    });

    if (!user) throw createError("user tidak ditemukan", 404);

    const accessTokenId = uuidv4();
    const refreshTokenId = uuidv4();

    // access token 1 jam
    const accessToken = jwt.sign(
      {
        id: userId,
        name: user.name,
        email: user.email,
        tokenId: accessTokenId,
      }, // add name, email
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    await prisma.accessToken.create({
      data: {
        token: accessToken,
        tokenId: accessTokenId,
        userId,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
      },
    });

    // refresh token 7 hari
    const refreshToken = jwt.sign(
      {
        id: userId,
        name: user.email,
        email: user.email,
        tokenId: refreshTokenId,
      },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        tokenId: refreshTokenId,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  },

  async loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw createError("email tidak ditemukan", 404);

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) throw createError("password salah", 400);

    // hapus semua sisa token user
    await prisma.accessToken.deleteMany({ where: { userId: user.id } });
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    // buat token baru
    const { accessToken, refreshToken } = await this.createTokens(user.id);

    const { password: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  },

  async refreshAccessToken(refreshToken: string) {
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      throw createError("refresh token tidak valid", 401);
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenId: payload.tokenId },
    });

    if (!stored) throw createError("refresh token tidak terdaftar", 401);
    if (stored.expiresAt < new Date())
      throw createError("refresh token kadaluarsa", 401);

    // generate access token baru
    const newAccessTokenId = uuidv4();
    const newAccessToken = jwt.sign(
      { id: payload.id, tokenId: newAccessTokenId },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    await prisma.accessToken.create({
      data: {
        token: newAccessToken,
        tokenId: newAccessTokenId,
        userId: payload.id,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
      },
    });

    return newAccessToken;
  },

  async logoutUser(refreshToken: string) {
    try {
      const payload: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

      // hapus semua token milik user
      await prisma.accessToken.deleteMany({ where: { userId: payload.id } });

      await prisma.refreshToken.deleteMany({
        where: { userId: payload.id },
      });
    } catch {
      // abaikan token invalid
    }

    return "logout berhasil";
  },
};
