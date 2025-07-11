import { ERROR_MESSAGES } from "@/config/const";
import { db } from "@/lib/db";
import { queries } from "@/lib/db/queries";
import { cache } from "@/lib/redis/methods";
import { AppError, CResponse, handleError, slugify } from "@/lib/utils";
import { updateAddressSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

interface RouteProps {
    params: Promise<{ uId: string; aId: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
    try {
        const { userId } = await auth();
        if (!userId)
            throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

        const { uId, aId } = await params;

        const body = await req.json();
        const parsed = updateAddressSchema.parse(body);

        const existingData = await queries.address.get({
            userId: uId,
            id: aId,
        });
        if (!existingData)
            throw new AppError(ERROR_MESSAGES.NOT_FOUND, "NOT_FOUND");

        const slug = slugify(parsed.alias);

        const existingDataWithSlug = await db.query.addresses.findFirst({
            where: (f, o) =>
                o.and(
                    o.eq(f.userId, uId),
                    o.eq(f.type, parsed.type),
                    o.eq(f.aliasSlug, slug),
                    o.ne(f.id, aId)
                ),
        });
        if (existingDataWithSlug)
            throw new AppError(ERROR_MESSAGES.CONFLICT, "CONFLICT");

        const data = await queries.address.update(aId, {
            ...parsed,
            aliasSlug: slug,
        });

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
    try {
        const { userId } = await auth();
        if (!userId)
            throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

        const user = await cache.user.get(userId);
        if (!user || user.role === "user")
            throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");

        const { uId, aId } = await params;

        if (user.addresses.length <= 1)
            throw new AppError(
                "You must have at least one address",
                "CONFLICT"
            );

        const existingData = await queries.address.get({
            userId: uId,
            id: aId,
        });
        if (!existingData)
            throw new AppError(ERROR_MESSAGES.NOT_FOUND, "NOT_FOUND");

        if (existingData.isPrimary)
            throw new AppError(
                "You cannot delete a primary address",
                "CONFLICT"
            );

        await Promise.all([
            queries.address.delete(aId),
            cache.user.remove(uId),
        ]);

        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
