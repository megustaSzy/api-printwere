import prisma from "../libs/prisma";
import { ProductData } from "../types/product";
import { createError } from "../utils/createError";

export const productService = {
  async getAll() {
    return prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getProductById(id: number) {
    const productId = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!productId) throw createError("id tidak ditemukkan", 404);

    return productId;
  },

  async createProdct(data: ProductData) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: data.name,
      },
    });

    if (existingProduct) throw createError("nama sudah ada", 400);

    return prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        price: data.price,
        stock: data.stock,
      },
    });
  },

  async editProductById(id: number, data: ProductData) {
    const productId = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!productId) throw createError("id tidak ditemukan", 404);

    return prisma.product.update({
      where: {
        id,
      },
      data,
    });
  },

  async deleteProductById(id: number) {
    const productId = await prisma.product.delete({
      where: {
        id,
      },
    });

    if (!productId) throw createError("id tidak ditemukan", 404);

    return prisma.product.delete({
      where: {
        id,
      },
    });
  },
};
