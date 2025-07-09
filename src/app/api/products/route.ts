import { env } from "@/../env";
import {
    DEFAULT_PRODUCT_PAGINATION_LIMIT,
    DEFAULT_PRODUCT_PAGINATION_PAGE,
    ERROR_MESSAGES,
} from "@/config/const";
import { queries } from "@/lib/db/queries";
import { cache } from "@/lib/redis/methods";
import {
    AppError,
    CResponse,
    generateProductSlug,
    handleError,
} from "@/lib/utils";
import { createProductSchema, Product } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const limit = searchParams.get("limit")
            ? parseInt(searchParams.get("limit") as string)
            : DEFAULT_PRODUCT_PAGINATION_LIMIT;
        const page = searchParams.get("page")
            ? parseInt(searchParams.get("page") as string)
            : DEFAULT_PRODUCT_PAGINATION_PAGE;
        const search = searchParams.get("search") || undefined;
        const minPrice = searchParams.get("minPrice")
            ? parseInt(searchParams.get("minPrice") as string)
            : undefined;
        const maxPrice = searchParams.get("maxPrice")
            ? parseInt(searchParams.get("maxPrice") as string)
            : undefined;
        const categoryId = searchParams.get("categoryId") || undefined;
        const subcategoryId = searchParams.get("subcategoryId") || undefined;
        const productTypeId = searchParams.get("productTypeId") || undefined;
        const isActive = searchParams.get("isActive")
            ? searchParams.get("isActive") === "true"
            : undefined;
        const isAvailable = searchParams.get("isAvailable")
            ? searchParams.get("isAvailable") === "true"
            : undefined;
        const isPublished = searchParams.get("isPublished")
            ? searchParams.get("isPublished") === "true"
            : undefined;
        const isDeleted = searchParams.get("isDeleted")
            ? searchParams.get("isDeleted") === "true"
            : undefined;
        const verificationStatus = searchParams.get("verificationStatus")
            ? (searchParams.get(
                  "verificationStatus"
              ) as Product["verificationStatus"])
            : undefined;
        const sortBy = searchParams.get("sortBy")
            ? (searchParams.get("sortBy") as "price" | "createdAt")
            : undefined;
        const sortOrder = searchParams.get("sortOrder")
            ? (searchParams.get("sortOrder") as "asc" | "desc")
            : undefined;

        const data = await queries.product.paginate({
            limit,
            page,
            search,
            minPrice,
            maxPrice,
            categoryId,
            subcategoryId,
            productTypeId,
            isActive,
            isAvailable,
            isPublished,
            isDeleted,
            verificationStatus,
            sortBy,
            sortOrder,
        });

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
            if (!user || user.role === "user")
                throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");
        }

        const body = await req.json();
        const parsed = createProductSchema.array().parse(body);

        const data = await queries.product.batch(
            parsed.map((item) => ({
                ...item,
                slug: generateProductSlug(item.title),
            }))
        );

        return CResponse({ message: "CREATED", data });
    } catch (err) {
        return handleError(err);
    }
}
