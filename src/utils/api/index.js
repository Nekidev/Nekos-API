import checkRateLimit from "./rate-limit";
import { getScopesFromToken } from "./authorization";

// Returns the authentication token's scopes if any, otherwise returns an empty
// array. If the response was set by the middleware (this function) returns
// false and the connection should be closed.
export async function middleware(
    req,
    res,
    { authorization: { required } } = {
        authorization: {
            required: false,
        },
    }
) {
    const scopes = await getScopesFromToken(req, res, required);

    if (scopes === false) {
        return false;
    }

    if (scopes.map((scope) => scope.toLowerCase()).includes("api:no-ratelimit")) {
        return scopes;
    } else {
        if (!(await checkRateLimit(req, res))) {
            return false;
        } else {
            return scopes;
        }
    }
}
