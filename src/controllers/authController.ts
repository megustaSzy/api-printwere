import { ResponseData } from "../utils/Response";
import { authService } from "../services/authService";
import { Request, Response } from "express";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const user = await authService.registerUser(req.body);
      return ResponseData.created(res, user);
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },

  async login(req: Request, res: Response) {

    const { email, password } = req.body;

    try {
      const { user, accessToken, refreshToken } = await authService.loginUser(
        email,
        password
      );

      return ResponseData.ok(
        res,
        { user, accessToken, refreshToken },
        "login berhasil"
      );
    } catch (error: any) {
      return ResponseData.unauthorized(res, error.message);
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ResponseData.unauthorized(res, "refresh token tidak ditemukan");
      }

      const newAccessToken = await authService.refreshAccessToken(refreshToken);

      return ResponseData.ok(
        res,
        { accessToken: newAccessToken },
        "token diperbarui"
      );
    } catch (error: any) {
      return ResponseData.unauthorized(res, error.message);
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await authService.logoutUser(refreshToken);
      }

      return ResponseData.ok(res, null, "logout berhasil");
    } catch (error: any) {
      return ResponseData.serverError(res, error.message);
    }
  },
};
