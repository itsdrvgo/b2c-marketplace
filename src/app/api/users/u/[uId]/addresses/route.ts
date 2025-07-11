import { ERROR_MESSAGES } from "@/config/const";
import { queries } from "@/lib/db/queries";
import { AppError, CResponse, handleError, slugify } from "@/lib/utils";
import { createAddressSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId)
            throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

        const body = await req.json();
        const parsed = createAddressSchema.parse(body);

        const slug = slugify(parsed.alias);

        const existingData = await queries.address.get({
            userId,
            slug,
            type: parsed.type,
        });
        if (existingData)
            throw new AppError(ERROR_MESSAGES.CONFLICT, "CONFLICT");

        const data = await queries.address.create({
            ...parsed,
            userId,
            aliasSlug: slug,
        });

        return CResponse({ message: "CREATED", data });
    } catch (err) {
        return handleError(err);
    }
}
