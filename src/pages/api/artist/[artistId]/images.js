import { PrismaClient } from "@prisma/client";

import supabase from "../../../../utils/supabase/client";

export default async function handler(req, res) {
    const { artistId, limit = "1", offset = "0" } = req.query;

    if (!/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(artistId)) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `artistId` parameter. Expected a UUID.",
            success: false,
        });
    } else if (!/^[0-9]+$/gi.test(limit) || parseInt(limit) < 1 || parseInt(limit) > 25) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `limit` parameter. Expected a number between 1 and 25.",
            success: false,
        });
    } else if (!/^[0-9]+$/gi.test(offset)) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `offset` parameter. Expected a number.",
            success: false,
        });
    }

    const prisma = new PrismaClient();

    const images = await prisma.images.findMany({
        where: {
            artist: artistId
        },
        skip: parseInt(offset),
        take: parseInt(limit),
    });

    var jsonImages = [];

    for (const image of images) {
        var file = await prisma.objects.findUnique({
            where: {
                id: image.file,
            },
        });

        const { data, error } = await supabase.storage
            .from("nekos-api")
            .createSignedUrl(file.name, 60 * 60);

        jsonImages.push({
            id: image.id,
            url: data.signedUrl,
            artist: image.artist,
            source: {
                name: image.source_name,
                url: image.source_url,
            },
            nsfw: image.nsfw,
            categories: image.categories,
            createdAt: image.created_at,
            meta: {
                eTag: file.metadata.eTag,
                size: file.metadata.size,
                mimetype: file.metadata.mimetype,
                dimens: {
                    height: image.height,
                    width: image.width,
                },
            }
        });
    }

    res.status(200).json({ 
        'data': jsonImages,
        'success': true
    });

    prisma.$disconnect();
} 