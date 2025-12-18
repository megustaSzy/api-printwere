import prisma from "../libs/prisma";
import bcrypt from "bcryptjs"
import { AuthData } from "../types/auth";
import { createError } from "../utils/createError";


export const authService = {

    async registerUser(data: AuthData) {
        const existing = await prisma.user.findFirst({
            where: {
                email: data.email
            }
        });

        if(existing) throw createError("id tidak ditemukan", 404);

        const hash = await bcrypt.hash(data.password, 10);

        return prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hash,
                role: data.role,
                notelp: data.notelp
            }
        });
    },

    async loginUser(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if(!user) throw createError("id tidak ditemukan", 404);

        const isMatch = await bcrypt.compare(password, user.password!);
        if(!isMatch) throw createError("password salah", 400);
    }

}