import prisma from "../libs/prisma"
import { ProductData } from "../types/product";
import { createError } from "../utils/createError";


export const productService = {

    async findAll() {
        return prisma.product.findMany({
            orderBy: {
                createdAt: "desc"
            }
        })
    },

    async getById(id: number) {
        const product = await prisma.product.findUnique({
            where: {
                id
            }
        });

        if(!product) throw createError("id tidak ditemukkan", 404);

        return product;
    },

    async createProducct(data: ProductData) {
        const product = await prisma.product.findFirst({
            where: {
                name: data.name
            }
        })

        if(product) throw createError("nama sudah ada", 400)
    }
}