require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const probe = require("probe-image-size");

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_ANON_SUPABASE_KEY
);

const prisma = new PrismaClient();

async function main() {
    const images = await prisma.images.findMany({
        where: {
            OR: {
                width: 0,
                height: 0,
            }
        }
    });

    const objects = await prisma.objects.findMany({
        where: {
            id: {
                in: images.map((img) => img.file)
            }
        }
    });

    var i = 1;

    for (const object of objects) {
        const signedUrl = (
            await supabase.storage
                .from('nekos-api')
                .createSignedUrl(object.name, 60)
        ).data.signedUrl;

        const dimensions = await probe(signedUrl);

        await prisma.images.update({
            where: {
                file: object.id,
            },
            data: {
                width: dimensions.width,
                height: dimensions.height,
            },
        });

        console.log(`Updated ${object.id} - ${dimensions.width}x${dimensions.height} - (${i++}/${objects.length})`)
    }

    console.log(`Updated ${objects.length} images`);
}

main();