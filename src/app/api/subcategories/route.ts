import { env } from "@/../env";
import { ERROR_MESSAGES } from "@/config/const";
import { queries } from "@/lib/db/queries";
import { cache } from "@/lib/redis/methods";
import { AppError, CResponse, handleError, slugify } from "@/lib/utils";
import { createSubcategorySchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET() {
    try {
        const data = await cache.subcategory.scan();
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
        const parsed = createSubcategorySchema.parse(body);

        const slug = slugify(parsed.name);

        const existingData = await queries.subcategory.get({ slug });
        if (existingData)
            throw new AppError(ERROR_MESSAGES.CONFLICT, "CONFLICT");

        const [data] = await Promise.all([
            queries.subcategory.create({ ...parsed, slug }),
            cache.category.remove(parsed.categoryId),
        ]);
        return CResponse({ message: "CREATED", data });
    } catch (err) {
        return handleError(err);
    }
}
