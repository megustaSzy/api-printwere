import { Request, response, Response } from "express";
import { productService } from "../services/productService";
import { ResponseData } from "../utils/Response";
import { realpathSync } from "fs";

export const productController = {
  async getAll(req: Request, res: Response) {
    try {
      const product = await productService.getAll();

      return ResponseData.ok(res, product);
    } catch (error) {
      return ResponseData.serverError(res, error);
    }
  },

  async getById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if(isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");

        const productById = await productService.getProductById(id);

        return ResponseData.ok(res, productById)
    } catch (error) {
        return ResponseData.serverError(res, error)
    }
  },

  async create(req: Request, res: Response) {
    try {
        const createProduct = await productService.createProdct(req.body);

        return ResponseData.created(res, createProduct);
    } catch (error) {
        return ResponseData.serverError(res, error)
    }
  },

  async edit(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if(isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");

        const editProduct = await productService.editProductById(id, req.body);

        return ResponseData.ok(res, editProduct)
    } catch (error) {
        return ResponseData.serverError(res, error)
    }
  },

  async deleteById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if(isNaN(id)) return ResponseData.badRequest(res, "id tidak valid");

        const deleteProduct = await productService.deleteProductById(id);

        return ResponseData.ok(res, deleteProduct)
    } catch (error) {
        return ResponseData.serverError(res, error)
    }
  }
};
