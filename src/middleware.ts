import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(1, "1 s"),
});

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
): Promise<Response | undefined> {
  const ip = request.ip ?? "127.0.0.1";

  const { success, pending, limit, reset, remaining } = await ratelimit.limit(
    `mw_${ip}`,
  );
  event.waitUntil(pending);

  const res = success
    ? NextResponse.next()
    : new NextResponse(
      JSON.stringify({
        'code': 429,
        'message': 'Too Many Requests',
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

  res.headers.set("X-RateLimit-Limit", limit.toString());
  res.headers.set("X-RateLimit-Remaining", remaining.toString());
  res.headers.set("X-RateLimit-Reset", reset.toString());
  return res;
}

export const config = {
  matcher: "/api/:path*",
};