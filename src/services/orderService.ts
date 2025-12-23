import prisma from "../libs/prisma";
import { OrderStatus } from "@prisma/client";
import { createError } from "../utils/createError";

interface OrderItemInput {
  productId: number;
  quantity: number;
}

export const orderService = {
  async create(userId: number, items: OrderItemInput[]) {
    return prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      const products = await tx.product.findMany({
        where: { id: { in: items.map((i) => i.productId) }, isActive: true },
      });

      if (products.length !== items.length) {
        throw createError("some products not found or inactive", 404);
      }

      const orderItems = items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;

        if (product.stock < item.quantity) {
          throw createError(`Stock ${product.name} tidak cukup`, 400);
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        return {
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          subtotal,
        };
      });

      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          userId,
          totalAmount,
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });
  },

  async findAll() {
    return prisma.order.findMany({
      include: {
        user: true,
        items: { include: { product: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { product: true } },
        payment: true,
      },
    });

    if (!order) throw createError("order tidak ditemukan", 404);

    return order;
  },

  async updateStatus(id: number, status: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) throw createError("Order not found", 404);

    if (order.status === "PAID") {
      throw createError("Order sudah dibayar, tidak bisa diubah", 400);
    }

    return prisma.order.update({
      where: { id },
      data: { status },
    });
  },

  async remove(id: number) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) throw createError("Order not found", 404);

      if (order.status === "PAID") {
        throw createError("Order sudah dibayar, tidak bisa dibatalkan", 400);
      }

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.order.delete({ where: { id } });

      return { message: "Order canceled successfully" };
    });
  },
};
