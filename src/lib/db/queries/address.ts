import { Address, CreateAddress, UpdateAddress } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { db } from "..";
import { addresses } from "../schemas";

class AddressQuery {
    async get({
        id,
        userId,
        type,
        slug,
    }: {
        id?: string;
        userId?: string;
        type?: Address["type"];
        slug?: string;
    }) {
        if (!id && !userId && !slug)
            throw new Error(
                "At least one of id, userId, or slug must be provided"
            );

        const data = await db.query.addresses.findFirst({
            where: (f, o) =>
                o.and(
                    id ? o.eq(f.id, id) : undefined,
                    userId ? o.eq(f.userId, userId) : undefined,
                    type ? o.eq(f.type, type) : undefined,
                    slug ? o.eq(f.aliasSlug, slug) : undefined
                ),
        });
        if (!data) return null;

        return data;
    }

    async create(
        values: CreateAddress & { userId: string; aliasSlug: string }
    ) {
        const data = await db.transaction(async (tx) => {
            if (values.isPrimary)
                await tx
                    .update(addresses)
                    .set({ isPrimary: false })
                    .where(eq(addresses.userId, values.userId));

            const result = await tx
                .insert(addresses)
                .values(values)
                .returning()
                .then((res) => res[0]);

            return result;
        });

        return data;
    }

    async update(id: string, values: UpdateAddress & { aliasSlug?: string }) {
        const data = await db.transaction(async (tx) => {
            if (values.isPrimary) {
                const currentAddress = await tx
                    .select({ userId: addresses.userId })
                    .from(addresses)
                    .where(eq(addresses.id, id))
                    .then((res) => res[0]);

                if (currentAddress)
                    await tx
                        .update(addresses)
                        .set({ isPrimary: false })
                        .where(eq(addresses.userId, currentAddress.userId));
            }

            const result = await tx
                .update(addresses)
                .set({
                    ...values,
                    updatedAt: new Date(),
                })
                .where(eq(addresses.id, id))
                .returning()
                .then((res) => res[0]);

            return result;
        });

        return data;
    }

    async delete(id: string) {
        const data = await db
            .delete(addresses)
            .where(eq(addresses.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }
}

export const addressQueries = new AddressQuery();
