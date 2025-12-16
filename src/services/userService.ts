import prisma from "../libs/prisma"
import { createError } from "../utils/createError";


export const userService = {

    async getUsers() {
        return prisma.user.findMany({
            orderBy: {
                id: 'asc'
            }
        })
    },

    async getById(id: number) {
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        });

        if(!user) throw createError("id tidak ditemukan", 404);

        return user
    }

}