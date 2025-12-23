import { Request, Response } from "express";
import { orderItemService } from "../services/orderItemService";
import { ResponseData } from "../utils/Response";

export const orderItemController = {
  async create(req: Request, res: Response) {
    try {
      const { orderId, productId, quantity } = req.body;

      const item = await orderItemService.create(orderId, productId, quantity);

      return ResponseData.created(res, item);
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },

  async updateQuantity(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { quantity } = req.body;

      if (isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");

      const item = await orderItemService.updateQuantity(id, quantity);
      return ResponseData.ok(res, item);
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");

      const result = await orderItemService.remove(id);

      return ResponseData.ok(res, result);
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },
};
