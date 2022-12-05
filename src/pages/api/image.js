import { Prisma, PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
    var { limit = "1", categories = "" } = req.query;

    if (
        !/^[0-9]+$/.test(limit) ||
        parseInt(limit) < 1 ||
        parseInt(limit) > 25
    ) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `limit` parameter. Expected a number between 1 and 25.",
            success: false,
        });
        return;
    }

    const prisma = new PrismaClient();

    categories = categories.split(',');
    const images = await prisma.$queryRaw`SELECT * FROM "Images" WHERE categories @> ARRAY[${Prisma.join(categories)}] ORDER BY RANDOM() LIMIT ${parseInt(limit)}`;

    var jsonImages = [];

    for (const image of images) {
        var file = await prisma.objects.findUnique({
            where: {
                id: image.file,
            }
        })

        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/sign/nekos-api/${file.name}`, {
            method: "post",
            mode: "cors",
            headers: {
                "apikey": process.env.NEXT_PUBLIC_SUPABASE_KEY,
                "Content-Type": "application/json",
            },
            data: JSON.stringify({
                expiresIn: 60 * 60
            })
        })
        const json = await response.json();
        const signedUrl = json;

        jsonImages.push({
            id: image.id,
            url: signedUrl,
            dimens: {
                height: image.height,
                width: image.width,
            },
            artist: image.artist,
            source: {
                name: image.source_name,
                url: image.source_url,
            },
            nsfw: image.nsfw,
            categories: image.categories,
            createdAt: image.created_at,
        });
    }

    res.status(200).json({
        data: jsonImages,
        success: true,
    });

    prisma.$disconnect();
}
