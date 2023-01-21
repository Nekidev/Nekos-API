import { Prisma, PrismaClient } from "@prisma/client";
import { getManyImagesJson } from "../../../utils/db";
import { middleware } from "../../../utils/api";
import { checkExpiryPermissions } from "../../../utils/api/authorization";

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    var { limit = "1", categories = "", expiry = "3600" } = req.query;

    if (!checkExpiryPermissions(res, expiry, scopes)) {
        // The function already sent a response.
        return;
    }

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

    const bernoulliPercentage = 20;

    categories = categories.toLowerCase().split(",");

    var images;

    if (categories.length == 1 && categories[0] == "") {
        images =
            await prisma.$queryRaw`SELECT * FROM "Images" TABLESAMPLE BERNOULLI (${bernoulliPercentage}) ORDER BY RANDOM() LIMIT (${parseInt(
                limit
            )})`;
    } else {
        const matchingCategories =
            await prisma.$queryRaw`SELECT * FROM "Categories" WHERE name ILIKE ANY(ARRAY[${Prisma.join(
                categories
            )}])`;
        if (categories.length != Array.from(matchingCategories).length) {
            var nonMatchingCategories = categories.filter(
                (category) =>
                    !matchingCategories
                        .map((category) => category.name.toLowerCase())
                        .includes(category)
            );

            res.status(400).json({
                code: 400,
                message: `Invalid value for \`categories\` parameter. The following categories do not exist: ${nonMatchingCategories.join(
                    ", "
                )}`,
                success: false,
            });
        }
        images =
            await prisma.$queryRaw`SELECT * FROM "Images" TABLESAMPLE BERNOULLI (${bernoulliPercentage}) WHERE categories @> ARRAY(SELECT id FROM "Categories" WHERE name ILIKE ANY(ARRAY[${Prisma.join(
                categories
            )}])) ORDER BY RANDOM() LIMIT (${parseInt(limit)})`;
    }

    if (images.length == 0) {
        res.status(404).json({
            code: 404,
            message: "Could not find images with the selected categories",
            success: false,
        });
    }

    res.status(200).json({
        data: await getManyImagesJson(images, prisma, {
            expiry: parseInt(expiry),
        }),
        success: true,
    });

    prisma.$disconnect();
}
