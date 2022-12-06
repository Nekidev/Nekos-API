import { Prisma, PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
    const { categoryId } = req.query;

    if (!/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(categoryId)) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `categoryId` parameter. Expected a UUID.",
            success: false,
        });
    }

    const prisma = new PrismaClient();

    const category = await prisma.categories.findUnique({
        where: {
            id: categoryId
        }
    });

    if (!category) {
        res.status(404).json({
            code: 404,
            message: "Category not found.",
            success: false,
        });
    }

    res.status(200).json({
        'data': {
            'id': category.id,
            'name': category.name,
            'description': category.description,
            'nsfw': category.nsfw,
            'images': await prisma.images.count({
                where: {
                    categories: {
                        has: category.id
                    }
                }
            }),
            'createdAt': category.createdAt,
        },
        'success': true
    });
}