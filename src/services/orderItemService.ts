import prisma from "../libs/prisma";
import { createError } from "../utils/createError";

export const orderItemService = {
  async create(orderId: number, productId: number, quantity: number) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) throw createError("Order tidak ditemukan", 404);
      if (order.status !== "PENDING") {
        throw createError("Order sudah diproses", 400);
      }

      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product || !product.isActive) {
        throw createError("Product tidak ditemukan", 404);
      }

      if (product.stock < quantity) {
        throw createError("Stok tidak cukup", 400);
      }

      const subtotal = product.price * quantity;

      const item = await tx.orderItem.create({
        data: {
          orderId,
          productId,
          quantity,
          price: product.price,
          subtotal,
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { totalAmount: { increment: subtotal } },
      });

      return item;
    });
  },

  async updateQuantity(id: number, quantity: number) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.findUnique({
        where: { id },
        include: { order: true, product: true },
      });

      if (!item) throw createError("Item tidak ditemukan", 404);
      if (item.order.status !== "PENDING") {
        throw createError("Order sudah diproses", 400);
      }

      const diff = quantity - item.quantity;

      if (diff > 0 && item.product.stock < diff) {
        throw createError("Stok tidak cukup", 400);
      }

      const newSubtotal = item.product.price * quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: diff } },
      });

      await tx.order.update({
        where: { id: item.orderId },
        data: {
          totalAmount: {
            increment: newSubtotal - item.subtotal,
          },
        },
      });

      return tx.orderItem.update({
        where: { id },
        data: {
          quantity,
          subtotal: newSubtotal,
        },
      });
    });
  },

  async remove(id: number) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.findUnique({
        where: { id },
        include: { order: true },
      });

      if (!item) throw createError("Item tidak ditemukan", 404);
      if (item.order.status !== "PENDING") {
        throw createError("Order sudah diproses", 400);
      }

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });

      await tx.order.update({
        where: { id: item.orderId },
        data: { totalAmount: { decrement: item.subtotal } },
      });

      await tx.orderItem.delete({ where: { id } });

      return { message: "Item berhasil dihapus" };
    });
  },
};
