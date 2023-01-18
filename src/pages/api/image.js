import { PrismaClient } from "@prisma/client";
import { middleware } from "../../utils/api";
import { getManyImagesJson } from "../../utils/db";

export default async function handler(req, res) {
    const scopes = await middleware(req, res, {
        authorization: {
            required: true
        }
    });

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    if (!scopes.includes('image:list')) {
        res.status(403).json({
            code: 403,
            message: "You don't have permission to access this resource.",
            success: false
        })
        return;
    }

    const { limit = "10", offset = "0" } = req.query;

    if (
        !/^[0-9]+$/.test(limit) ||
        parseInt(limit) < 1 ||
        parseInt(limit) > 50
    ) {
        res.status(400).json({
            code: 400,
            message:
                "Invalid value for `limit` parameter. Expected a number between 1 and 50.",
            success: false,
        });
        return;
    } else if (!/^[0-9]+$/.test(offset) || parseInt(offset) < 0) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `offset` parameter. Expected a number greater than 0.",
            success: false
        })
        return;
    }

    const prisma = new PrismaClient();

    const images = await prisma.images.findMany({
        take: parseInt(limit),
        skip: parseInt(offset)
    })

    res.status(200).json({
        data: await getManyImagesJson(images, prisma),
        success: true
    })

    prisma.$disconnect();
}