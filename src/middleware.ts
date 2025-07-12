import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
    const url = new URL(req.url);
    const res = NextResponse.next();

    if (
        url.pathname.startsWith("/api/webhooks") ||
        url.pathname === "/api/uploadthing"
    )
        return res;

    if (url.pathname === "/auth")
        return NextResponse.redirect(new URL("/auth/signin", url));

    if (url.pathname.startsWith("/api")) return res;

    const isAuth = await auth();

    if (isAuth.sessionId) {
        if (url.pathname.startsWith("/auth"))
            return NextResponse.redirect(new URL("/", url));

        if (url.pathname.startsWith("/dashboard")) {
            if (url.pathname === "/dashboard")
                return NextResponse.redirect(
                    new URL("/dashboard/products", url)
                );
        }
    } else {
        if (url.pathname.startsWith("/dashboard"))
            return NextResponse.redirect(new URL("/auth/signin", url));
    }

    return res;
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/api/:path*",
        "/",
        "/dashboard/:path*",
        "/auth/:path*",
    ],
};
