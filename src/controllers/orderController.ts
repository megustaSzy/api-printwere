import { Request, Response } from "express";
import { orderService } from "../services/orderService";
import { ResponseData } from "../utils/Response";

export const orderController = {
  async create(req: Request, res: Response) {
    try {
      const { userId, items } = req.body;
      const order = await orderService.create(userId, items);
      return ResponseData.created(res, order);
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const orders = await orderService.findAll();
      return ResponseData.ok(res, orders);
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");

      const order = await orderService.findById(id);
      return ResponseData.ok(res, order);
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");

      const { status } = req.body;

      const order = await orderService.updateStatus(id, status);
      return ResponseData.ok(res, order);
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");

      const result = await orderService.remove(id);

      return ResponseData.ok(res, result);
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },
};
