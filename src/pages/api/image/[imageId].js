import { PrismaClient } from "@prisma/client";
import { getImageJson } from "../../../utils/db";
import { middleware } from "../../../utils/api";
import { checkExpiryPermissions } from "../../../utils/api/authorization";

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    const { imageId, expiry = "3600" } = req.query;

    if (
        !/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(
            imageId
        )
    ) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `imageId` parameter. Expected a UUID.",
            success: false,
        });
        return;
    }

    if (!checkExpiryPermissions(res, expiry, scopes)) {
        // The function already sent a response.
        return;
    }

    const prisma = new PrismaClient();

    const image = await prisma.images.findUnique({
        where: {
            id: imageId,
        },
    });

    if (!image) {
        res.status(404).json({
            code: 404,
            message: "Could not find image with ID: " + imageId,
            success: false,
        });
        prisma.$disconnect();
        return;
    }

    res.status(200).json({
        data: await getImageJson(image, prisma, {
            expiry: typeof expiry == 'number' ? expiry : parseInt(expiry),
        }),
        success: true,
    });

    prisma.$disconnect();
}
