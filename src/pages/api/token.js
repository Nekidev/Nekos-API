import { PrismaClient } from "@prisma/client";
import { middleware } from "../../utils/api";

export default async function handler(req, res) {
    const scopes = await middleware(req, res, { authorization: { required: true } });

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    const prisma = new PrismaClient();
    
    const { authorization: bearer_token } = req.headers;

    const token = await prisma.tokens.findUnique({
        where: {
            token: bearer_token.substring("Bearer ".length)
        }
    })

    res.status(200).json({ 
        data: {
            owner: token.owner,
            purpose: token.purpose,
            scopes: token.scopes,
            issuedBy: token.issued_by,
            createdAt: token.created_at,
            expires: token.expires
        },
        success: true
    })

    prisma.$disconnect()
}