import { Prisma, PrismaClient } from "@prisma/client";
import { getManyImagesJson } from "../../utils/db";
import checkRateLimit from "../../utils/api/rate-limit";

export default async function handler(req, res) {
    if (!(await checkRateLimit(req, res))) {
        // Rate limit exceeded
        return;
    }

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

    const bernoulliPercentage = 14;

    categories = categories.toLowerCase().split(",");

    var images;

    if (categories.length == 1 && categories[0] == "") {
        images = await prisma.$queryRaw`SELECT * FROM "Images" TABLESAMPLE BERNOULLI (${bernoulliPercentage}) ORDER BY RANDOM() LIMIT (${parseInt(limit)})`;
    } else {
        const matchingCategories = await prisma.$queryRaw`SELECT * FROM "Categories" WHERE name ILIKE ANY(ARRAY[${Prisma.join(categories)}])`
        if (categories.length != Array.from(matchingCategories).length) {
            var nonMatchingCategories = categories.filter(category => !matchingCategories.map(category => category.name.toLowerCase()).includes(category))
            
            res.status(400).json({
                code: 400,
                message: `Invalid value for \`categories\` parameter. The following categories do not exist: ${nonMatchingCategories.join(", ")}`,
                success: false,
            })
        }
        images = await prisma.$queryRaw`SELECT * FROM "Images" TABLESAMPLE BERNOULLI (${bernoulliPercentage}) WHERE categories @> ARRAY(SELECT id FROM "Categories" WHERE name ILIKE ANY(ARRAY[${Prisma.join(categories)}])) ORDER BY RANDOM() LIMIT (${parseInt(limit)})`;
    }

    res.status(200).json({
        data: await getManyImagesJson(images, prisma),
        success: true,
    });

    prisma.$disconnect();
}
