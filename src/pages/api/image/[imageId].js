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
    const file = await prisma.objects.findUnique({
        where: {
            id: image.file
        }
    });

    const signedUrl = await supabase.storage.from("nekos-api").createSignedUrl(file.name, 60 * 60);

    res.status(200).json({ 
        'data': {
            'id': image.id,
            'url': signedUrl.data.signedUrl,
            'artist': image.artist,
            'source': {
                'name': image.source_name,
                'url': image.source_url
            },
            'nsfw': image.nsfw,
            'categories': image.categories,
            'createdAt': image.created_at,
            'meta': {
                'eTag': file.metadata.eTag,
                'size': file.metadata.size,
                'mimetype': file.metadata.mimetype,
                'dimens': {
                    'height': image.height,
                    'width': image.width,
                },
            }
        },
        'success': true
    });

    prisma.$disconnect();
}