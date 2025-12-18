import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

async function proxy(request: NextRequest) {
    const { pathname, search } = new URL(request.url);

    // /api/proxy/auth/login → /auth/login
    const targetPath = pathname.replace("/api/proxy", "");
    const targetUrl = `${BASE_URL}${targetPath}${search}`;

    const response = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body:
            request.method === "GET" || request.method === "HEAD"
                ? undefined
                : request.body,
        credentials: "include",
    });

    return new NextResponse(response.body, {
        status: response.status,
        headers: response.headers,
    });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
