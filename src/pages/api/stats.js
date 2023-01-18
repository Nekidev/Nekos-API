import { PrismaClient } from '@prisma/client';
import { middleware } from "../../utils/api";
import redis from '../../utils/api/redis';

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    let stats;

    const redis_key = 'cache:api-stats';
    const redis_stats = await redis.get(redis_key)
    if (redis_stats) {
        stats = redis_stats
    } else {
        const prisma = new PrismaClient();

        stats = (await prisma.$queryRaw`
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

        await prisma.$disconnect()

        for (const key in stats) {
            if (typeof stats[key] == 'bigint') {
                stats[key] = parseInt(stats[key])
            }
        }

        await redis.set(redis_key, JSON.stringify(stats), {
            ex: 300, // 5 minute
            nx: true
        })
    }

    res.status(200).json({
        data: {
            images: {
                count: stats.images_count,
                nsfw: {
                    nsfw: stats.images_nsfw__nsfw__count,
                    questionable: stats.images_nsfw__questionable__count,
                    sfw: stats.images_count - stats.images_nsfw__nsfw__count - stats.images_nsfw__questionable__count
                },
                original: {
                    yes: stats.images_original__true__count,
                    no: stats.images_original__false__count,
                    unknown: stats.images_count - stats.images_original__false__count - stats.images_original__true__count
                },
                resolution: {
                    sd: stats.images_resolution__sd__count,
                    hd: stats.images_resolution__hd__count,
                    fhd: stats.images_resolution__fhd__count,
                    uhd: stats.images_resolution__uhd__count
                },
                orientation: {
                    portrait: stats.images_orientation__portrait__count,
                    landscape: stats.images_orientation__landscape__count,
                    square: stats.images_count - stats.images_orientation__landscape__count - stats.images_orientation__portrait__count
                }
            },
            categories: {
                type: {
                    settings: stats.categories_type__setting__count,
                    character: stats.categories_type__character__count,
                    format: stats.categories_type__format__count
                },
                nsfw: {
                    nsfw: stats.categories_nsfw__nsfw__count,
                    sfw: stats.categories_count - stats.categories_nsfw__nsfw__count
                },
                count: stats.categories_count
            },
            artists: {
                count: stats.artists_count
            },
            characters: {
                count: stats.characters_count,
                sources: stats.characters_sources__unique__count
            }
        },
        success: true
    })
}