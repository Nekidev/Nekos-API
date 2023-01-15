export default `
    scalar Date

    enum Nsfw {
        sfw
        questionable
        nsfw
    }

    enum ImageOrientation {
        landscape
        portrait
        square
    }

    type _Source {
        name: String
        url: String
    }

    type _ImageDimens {
        height: Int
        width: Int
        aspectRatio: String
        orientation: ImageOrientation!
    }

    type _ImageMeta {
        eTag: String!
        size: Int!
        mimetype: String!
        color: String
        expires: Date!
        dimens: _ImageDimens!
    }

    type Artist {
        id: ID!
        name: String!
        url: String!
        images: Int
    }

    type Category {
        id: ID!
        name: String!
        description: String!
        nsfw: Boolean!
        type: String!
        images: Int
        createdAt: Date!
    }

    type Character {
        id: ID!
        name: String!
        description: String
        source: String
        createdAt: Date!
    }

    type Image {
        id: ID!
        url: String!
        artist: Artist
        source: _Source!
        original: Boolean
        nsfw: Nsfw
        categories: [Category!]
        characters: [Character!]
        createdAt: Date!
        meta: _ImageMeta!
    }

    type Query {
        getRandomImages(limit: Int! = 1, categories: [String!]): [Image!]
    }
`