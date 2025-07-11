import { CreateMediaItem, UpdateMediaItem } from "@/lib/validations";
import { eq, inArray } from "drizzle-orm";
import { db } from "..";
import { mediaItems } from "../schemas";

class MeditaItemQuery {
    async count(ids?: string[]) {
        const data = await db.$count(
            mediaItems,
            ids ? inArray(mediaItems.id, ids) : undefined
        );
        return +data || 0;
    }

    async scan(ids: string[] = []) {
        const data = await db.query.mediaItems.findMany({
            where: (f, o) => o.inArray(f.id, ids),
        });

        return data.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
    }

    async get(id: string) {
        const data = await db.query.mediaItems.findFirst({
            where: (f, o) => o.eq(f.id, id),
        });
        if (!data) return null;

        return data;
    }

    async create(values: CreateMediaItem[]) {
        const data = await db.insert(mediaItems).values(values).returning();
        return data;
    }

    async update(id: string, values: UpdateMediaItem) {
        const data = await db
            .update(mediaItems)
            .set({ ...values, updatedAt: new Date() })
            .where(eq(mediaItems.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async delete(ids: string[]) {
        const data = await db
            .delete(mediaItems)
            .where(inArray(mediaItems.id, ids))
            .returning();

        return data;
    }
}

export const mediaItemQueries = new MeditaItemQuery();
