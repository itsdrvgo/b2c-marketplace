import { env } from "@/../env";
import { ERROR_MESSAGES } from "@/config/const";
import { queries } from "@/lib/db/queries";
import { cache } from "@/lib/redis/methods";
import { AppError, CResponse, handleError, slugify } from "@/lib/utils";
import { updateCategorySchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

interface RouteProps {
    params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: RouteProps) {
    try {
        const { id } = await params;

        const data = await cache.category.get(id);
        if (!data) throw new AppError(ERROR_MESSAGES.NOT_FOUND, "NOT_FOUND");

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
    try {
        if (env.IS_API_AUTHENTICATED) {
            const { userId } = await auth();
            if (!userId)
                throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

            const user = await cache.user.get(userId);
            if (!user || user.role !== "admin")
                throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");
        }

        const { id } = await params;
        const body = await req.json();
        const parsed = updateCategorySchema.parse(body);

        const existingData = await cache.category.get(id);
        if (!existingData)
            throw new AppError(ERROR_MESSAGES.NOT_FOUND, "NOT_FOUND");

        const slug = parsed.name ? slugify(parsed.name) : existingData.slug;

        if (slug !== existingData.slug) {
            const existingDataBySlug = await queries.category.get({ slug });
            if (existingDataBySlug)
                throw new AppError(ERROR_MESSAGES.CONFLICT, "CONFLICT");
        }

        const [data] = await Promise.all([
            queries.category.update(id, { ...parsed, slug }),
            cache.category.remove(id),
        ]);

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(_: NextRequest, { params }: RouteProps) {
    try {
        if (env.IS_API_AUTHENTICATED) {
            const { userId } = await auth();
            if (!userId)
                throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

            const user = await cache.user.get(userId);
            if (!user || user.role !== "admin")
                throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");
        }

        const { id } = await params;

        const existingData = await cache.category.get(id);
        if (!existingData)
            throw new AppError(ERROR_MESSAGES.NOT_FOUND, "NOT_FOUND");

        const [data] = await Promise.all([
            queries.category.delete(id),
            cache.category.remove(id),
        ]);

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}
