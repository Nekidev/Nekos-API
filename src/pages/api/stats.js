import { PrismaClient } from '@prisma/client';
import checkRateLimit from "../../utils/api/rate-limit";

export default async function handler(req, res) {
    if (!(await checkRateLimit(req, res))) {
        // Rate limit exceeded
        return;
    }

    const prisma = new PrismaClient();

    const stats = (await prisma.$queryRaw`
        SELECT
            (SELECT COUNT(*) FROM "Images") AS images_count,
            (SELECT COUNT(*) FROM "Images" WHERE "Images".nsfw = 'questionable') AS images_nsfw__questionable__count,
            (SELECT COUNT(*) FROM "Images" WHERE "Images".nsfw = 'nsfw') AS images_nsfw__nsfw__count,
            (SELECT COUNT(*) FROM "Images" WHERE "Images".original = true) AS images_original__true__count,
            (SELECT COUNT(*) FROM "Images" WHERE "Images".original = false) AS images_original__false__count,
            (SELECT COUNT(*) FROM "Images" WHERE ("Images".height >= 2160 AND "Images".width >= 3840) OR ("Images".height >= 3840 AND "Images".width >= 2160)) AS images_resolution__uhd__count,
            (SELECT COUNT(*) FROM "Images" WHERE (("Images".height >= 1080 AND "Images".width >= 1920) OR ("Images".height >= 1920 AND "Images".width >= 1080)) AND (("Images".height < 2160 AND "Images".width < 3840) OR ("Images".height < 3840 AND "Images".width < 2160))) AS images_resolution__fhd__count,
            (SELECT COUNT(*) FROM "Images" WHERE (("Images".height >= 1280 AND "Images".width >= 720) OR ("Images".height >= 720 AND "Images".width >= 1280)) AND (("Images".height < 1080 AND "Images".width < 1920) OR ("Images".height < 1920 AND "Images".width < 1080))) AS images_resolution__hd__count,
            (SELECT COUNT(*) FROM "Images" WHERE (("Images".height >= 480 AND "Images".width >= 640) OR ("Images".height >= 640 AND "Images".width >= 480)) AND (("Images".height < 720 AND "Images".width < 1280) OR ("Images".height < 1280 AND "Images".width < 720))) AS images_resolution__sd__count,
            (SELECT COUNT(*) FROM "Images" WHERE "Images".height > "Images".width) AS images_orientation__portrait__count,
            (SELECT COUNT(*) FROM "Images" WHERE "Images".height < "Images".width) AS images_orientation__landscape__count,
            (SELECT COUNT(*) FROM "Categories") AS categories_count,
            (SELECT COUNT(*) FROM "Categories" WHERE "Categories".type = 'setting') AS categories_type__setting__count,
            (SELECT COUNT(*) FROM "Categories" WHERE "Categories".type = 'character') AS categories_type__character__count,
            (SELECT COUNT(*) FROM "Categories" WHERE "Categories".type = 'format') AS categories_type__format__count,
            (SELECT COUNT(*) FROM "Categories" WHERE "Categories".nsfw = true) AS categories_nsfw__nsfw__count,
            (SELECT COUNT(*) FROM "Artists") AS artists_count,
            (SELECT COUNT(*) FROM "Characters") AS characters_count,
            (SELECT COUNT(*) FROM (SELECT DISTINCT "Characters".source FROM "Characters" WHERE "Characters".source IS NOT NULL) AS temp) AS characters_sources__unique__count
    `)[0]

    res.status(200).json({
        data: {
            images: {
                count: parseInt(stats.images_count),
                nsfw: {
                    nsfw: parseInt(stats.images_nsfw__nsfw__count),
                    questionable: parseInt(stats.images_nsfw__questionable__count),
                    sfw: parseInt(stats.images_count - stats.images_nsfw__nsfw__count - stats.images_nsfw__questionable__count)
                },
                original: {
                    yes: parseInt(stats.images_original__true__count),
                    no: parseInt(stats.images_original__false__count),
                    unknown: parseInt(stats.images_count - stats.images_original__false__count - stats.images_original__true__count)
                },
                resolution: {
                    sd: parseInt(stats.images_resolution__sd__count),
                    hd: parseInt(stats.images_resolution__hd__count),
                    fhd: parseInt(stats.images_resolution__fhd__count),
                    uhd: parseInt(stats.images_resolution__uhd__count)
                },
                orientation: {
                    portrait: parseInt(stats.images_orientation__portrait__count),
                    landscape: parseInt(stats.images_orientation__landscape__count),
                    square: parseInt(stats.images_count - stats.images_orientation__landscape__count - stats.images_orientation__portrait__count)
                }
            },
            categories: {
                type: {
                    settings: parseInt(stats.categories_type__setting__count),
                    character: parseInt(stats.categories_type__character__count),
                    format: parseInt(stats.categories_type__format__count)
                },
                nsfw: {
                    nsfw: parseInt(stats.categories_nsfw__nsfw__count),
                    sfw: parseInt(stats.categories_count - stats.categories_nsfw__nsfw__count)
                },
                count: parseInt(stats.categories_count)
            },
            artists: {
                count: parseInt(stats.artists_count)
            },
            characters: {
                count: parseInt(stats.characters_count),
                sources: parseInt(stats.characters_sources__unique__count)
            }
        },
        success: true
    })
}