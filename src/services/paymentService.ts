import prisma from "../libs/prisma";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { createError } from "../utils/createError";

export const paymentService = {
  // CREATE PAYMENT
  async create(orderId: number, method: PaymentMethod, amountPaid: number) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { payment: true },
      });

      if (!order) throw createError("Order tidak ditemukan", 404);

      if (order.status === "PAID") {
        throw createError("Order sudah dibayar", 400);
      }

      if (order.payment) {
        throw createError("Payment untuk order ini sudah ada", 400);
      }

      if (amountPaid < order.totalAmount) {
        throw createError("Jumlah pembayaran kurang", 400);
      }

      const payment = await tx.payment.create({
        data: {
          orderId,
          method,
          amountPaid,
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      return payment;
    });
  },

  // GET ALL PAYMENTS
  async findAll() {
    return prisma.payment.findMany({
      include: {
        order: {
          include: {
            user: true,
            items: { include: { product: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // GET PAYMENT BY ID
  async findById(id: number) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: true,
            items: { include: { product: true } },
          },
        },
      },
    });

    if (!payment) throw createError("Payment tidak ditemukan", 404);

    return payment;
  },

  // UPDATE PAYMENT STATUS (optional)
  async updateStatus(id: number, status: PaymentStatus) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!payment) throw createError("Payment tidak ditemukan", 404);

    if (payment.status === "SUCCESS") {
      throw createError("Payment sudah sukses, tidak bisa diubah", 400);
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status,
        paidAt: status === "SUCCESS" ? new Date() : null,
      },
    });

    if (status === "SUCCESS") {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID" },
      });
    }

    return updatedPayment;
  },

  // DELETE PAYMENT (biasanya hanya admin)
  async remove(id: number) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id },
        include: { order: true },
      });

      if (!payment) throw createError("Payment tidak ditemukan", 404);

      if (payment.status === "SUCCESS") {
        throw createError("Payment sukses tidak bisa dihapus", 400);
      }

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "PENDING" },
      });

      await tx.payment.delete({ where: { id } });

      return { message: "Payment berhasil dihapus" };
    });
  },
};
