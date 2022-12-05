import { PrismaClient } from "@prisma/client";

import supabase from "../../../utils/supabase/client";

export default async function handler(req, res) {
    const { imageId } = req.query;

    if (!/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(imageId)) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `imageId` parameter. Expected a UUID.",
            success: false,
        });
    }

    const prisma = new PrismaClient();

    const image = await prisma.images.findUnique({
        where: {
            id: imageId
        }
    });

    res.status(200).json({ 
        data: {
            'id': image.id,
            'url': image.url,
            'dimens': {
                'width': image.width,
                'height': image.height,
            },
            'artist': image.artist,
            'source': {
                'name': image.source_name,
                'url': image.source_url
            },
            'nsfw': image.nsfw,
            'categories': image.categories,
            'createdAt': image.created_at,
        },
        success: true
    });

    prisma.$disconnect();
}