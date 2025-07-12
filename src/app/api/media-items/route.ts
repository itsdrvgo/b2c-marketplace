import { env } from "@/../env";
import { ERROR_MESSAGES } from "@/config/const";
import { queries } from "@/lib/db/queries";
import { cache } from "@/lib/redis/methods";
import { AppError, CResponse, handleError } from "@/lib/utils";
import { createMediaItemSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET() {
    try {
        if (env.IS_API_AUTHENTICATED) {
            const { userId } = await auth();
            if (!userId)
                throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

            const user = await cache.user.get(userId);
            if (!user || user.role === "user")
                throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");
        }

        const data = await cache.mediaItem.scan();
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        if (env.IS_API_AUTHENTICATED) {
            const { userId } = await auth();
            if (!userId)
                throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

            const user = await cache.user.get(userId);
            if (!user || user.role !== "admin")
                throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");
        }

        const body = await req.json();
        const parsed = createMediaItemSchema.array().parse(body);

        const [data] = await Promise.all([
            queries.mediaItem.create(parsed),
            cache.mediaItem.drop(),
        ]);
        return CResponse({ message: "CREATED", data });
    } catch (err) {
        return handleError(err);
    }
}
