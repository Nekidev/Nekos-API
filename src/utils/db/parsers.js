async function _parseMany(rows, parser) {
    var result = [];

    for (var i = 0; i < rows.length; i++) {
        result.push(await parser(rows[i]));
    }

    return result;
}

export default async function parseImage(
    image,
    file,
    url,
    artist,
    categories,
    characters,
    expiresIn = 60 * 60
) {
    const imageOrientation = image.width > image.height ? "landscape" : image.width < image.height ? "portrait" : "square";

    return {
        id: image.id,
        url: url,
        artist: await parseArtist(artist),
        source: {
            name: image.source_name,
            url: image.source_url,
        },
        original: image.original,
        nsfw: image.nsfw,
        categories: await _parseMany(categories, parseCategory),
        characters: await _parseMany(characters, parseCharacter),
        createdAt: image.created_at,
        meta: {
            eTag: file.metadata.eTag,
            size: file.metadata.size,
            mimetype: file.metadata.mimetype,
            color: image.color,
            expires: new Date(Date.now() + expiresIn * 1000),
            dimens: {
                height: image.height,
                width: image.width,
                aspectRatio: image.aspect_ratio,
                orientation: imageOrientation
            },
        }
    }
}

export async function parseCharacter(character, prismaClient = null) {
    var imageCount = undefined;

    if (prismaClient) {
        imageCount = await prismaClient.images.count({
            where: {
                characters: {
                    hasSome: [character.id],
                },
            },
        });
    }

    return {
        id: character.id,
        name: character.name,
        description: character.description,
        source: character.source,
        createdAt: character.created_at,
    }
}

export async function parseCategory(category, prismaClient = null) {
    var imageCount = undefined;

    if (prismaClient) {
        imageCount = await prismaClient.images.count({
            where: {
                categories: {
                    hasSome: [category.id],
                },
            },
        });
    }

    return {
        id: category.id,
        name: category.name,
        description: category.description,
        nsfw: category.nsfw,
        type: category.type,
        images: imageCount,
        createdAt: category.created_at,
    }
}

export async function parseArtist(artist, prismaClient = null) {
    var imageCount = undefined;

    if (prismaClient) {
        imageCount = await prismaClient.images.count({
            where: {
                artist: artist.id,
            },
        });
    }

    return artist ? {
        id: artist.id,
        name: artist.name,
        url: artist.url,
        images: imageCount,
    } : null
}