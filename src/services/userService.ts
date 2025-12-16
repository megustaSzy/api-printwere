import prisma from "../libs/prisma";
import { UserData } from "../types/user";
import { createError } from "../utils/createError";

export const userService = {
  async getUsers() {
    return prisma.user.findMany({
      orderBy: {
        id: "asc",
      },
    });
  },

  async getById(id: number) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) throw createError("id tidak ditemukan", 404);

    return user;
  },

  async editUser(id: number, data: UserData) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) throw createError("id tidak ditemukan", 404);

    const check = await prisma.user.findFirst({
      where: {
        email: data.email
      }
    });

    if(!check) throw createError("email tidak ditemukan", 404);

    return prisma.user.update({
      where: {
        id,
      },
      data,
    });
  },

  async deleteUser(id: number) {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    });

    if(!user) throw createError("id tidak ditemukan", 404);

    return prisma.user.delete({
      where:{
        id
      }
    })
  }
};
