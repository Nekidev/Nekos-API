import { Prisma, PrismaClient } from "@prisma/client";

import supabase from "../../utils/supabase/client";

export default async function handler(req, res) {
    var { limit = "1", categories = "" } = req.query;

    if (
        !/^[0-9]+$/.test(limit) ||
        parseInt(limit) < 1 ||
        parseInt(limit) > 25
    ) {
        res.status(400).json({
            code: 400,
            message:
                "Invalid value for `limit` parameter. Expected a number between 1 and 25.",
            success: false,
        });
        return;
    }

    const prisma = new PrismaClient();

    categories = categories.split(",");

    var images;

    if (categories.length == 1 && categories[0] == "") {
        images = await prisma.$queryRaw`SELECT * FROM "Images" ORDER BY RANDOM() LIMIT ${parseInt(
            limit
        )}`;
    } else {
        images = await prisma.$queryRaw`SELECT * FROM "Images" WHERE categories @> ARRAY[${Prisma.join(
            categories
        )}] ORDER BY RANDOM() LIMIT ${parseInt(limit)}`;
    }

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
        data: jsonImages,
        success: true,
    });

    prisma.$disconnect();
}
