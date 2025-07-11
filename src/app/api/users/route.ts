import { env } from "@/../env";
import {
    DEFAULT_PAGINATION_LIMIT,
    DEFAULT_PAGINATION_PAGE,
    ERROR_MESSAGES,
} from "@/config/const";
import { queries } from "@/lib/db/queries";
import { cache } from "@/lib/redis/methods";
import { AppError, CResponse, handleError } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        if (env.IS_API_AUTHENTICATED) {
            const { userId } = await auth();
            if (!userId)
                throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

            const user = await cache.user.get(userId);
            if (!user || user.role !== "admin")
                throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");
        }

        const { searchParams } = new URL(req.url);

        const limit = searchParams.get("limit")
            ? parseInt(searchParams.get("limit") as string)
            : DEFAULT_PAGINATION_LIMIT;
        const page = searchParams.get("page")
            ? parseInt(searchParams.get("page") as string)
            : DEFAULT_PAGINATION_PAGE;
        const search = searchParams.get("search") || undefined;

        const data = await queries.user.paginate({ limit, page, search });
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
