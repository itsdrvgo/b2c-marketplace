import { ERROR_MESSAGES } from "@/config/const";
import { cache } from "@/lib/redis/methods";
import { AppError, CResponse, handleError } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId)
            throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

        const data = await cache.user.get(userId);
        if (!data)
            throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, "NOT_FOUND");

        return CResponse({ data });
    } catch (err) {
        console.error(err);
        return handleError(err);
    }
}
