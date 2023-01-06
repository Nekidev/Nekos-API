import { PrismaClient } from "@prisma/client";

export async function getScopesFromToken(req, res, required = false) {
    const { authorization: token } = req.headers;

    if (!token && required) {
        res.status(401).json({
            code: 401,
            message: "You need an access token to access this resource.",
            success: false
        })
        return false;
    } else if (!token && !required) {
        return [];
    }

    const exp = /^Bearer (?<token>[0-9a-zA-Z]{100})$/
    
    if (!exp.test(token)) {
        res.status(401).json({
            code: 401,
            message: "The authentication token is invalid. It should match `^Bearer [0-9a-zA-Z]{100}$`.",
            success: false
        })
        return false;
    }

    const prisma = new PrismaClient();

    const row = await prisma.tokens.findUnique({
        where: {
            token: exp.exec(token).groups.token
        }
    })

    if (!row) {
        res.status(401).json({
            code: 401,
            message: "The authentication token is invalid.",
            success: false
        })
        return false;
    }

    prisma.$disconnect();

    return row.scopes;
}