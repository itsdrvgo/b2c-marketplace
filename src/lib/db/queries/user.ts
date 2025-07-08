import { fullUserSchema } from "@/lib/validations/user";
import { desc, eq, ilike } from "drizzle-orm";
import { db } from "..";
import { users } from "../schemas";

class UserQuery {
    async paginate({
        limit,
        page,
        search,
    }: {
        limit: number;
        page: number;
        search?: string;
    }) {
        const data = await db.query.users.findMany({
            where: !!search?.length
                ? ilike(users.email, `%${search}%`)
                : undefined,
            with: { addresses: true },
            limit,
            offset: (page - 1) * limit,
            orderBy: [desc(users.createdAt)],
            extras: {
                count: db
                    .$count(
                        users,
                        !!search?.length
                            ? ilike(users.email, `%${search}%`)
                            : undefined
                    )
                    .as("users_count"),
            },
        });

        const items = +data?.[0]?.count || 0;
        const pages = Math.ceil(items / limit);

        const parsed = fullUserSchema.array().parse(data);

        return {
            data: parsed,
            items,
            pages,
        };
    }

    async get(id: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, id),
            with: { addresses: true },
        });
        if (!user) return null;

        return fullUserSchema.parse(user);
    }
}

export const userQueries = new UserQuery();
