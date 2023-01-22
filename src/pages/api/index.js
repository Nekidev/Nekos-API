import { middleware } from "../../utils/api";

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    res.status(200).json({
        data: [
            "/",
            "/stats",
            "/token",
            "/image",
            "/image/:id",
            "/image/random",
            "/set",
            "/set/:id",
            "/character",
            "/character/:id",
            "/category",
            "/category/:id",
            "/artist",
            "/artist/:id",
            "/artist/:id/images",
        ],
        meta: {
            version: "v1.6.0",
            baseApiRoute: "/api"
        },
        success: true,
    });
}
