import { env } from "@/../env";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schemas";
import { cache } from "@/lib/redis/methods";
import { CResponse, handleError } from "@/lib/utils";
import {
    clerkWebhookSchema,
    userDeleteWebhookSchema,
    userWebhookSchema,
} from "@/lib/validations";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { Webhook } from "svix";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        const headers: SvixHeaders = {
            "svix-id": req.headers.get("svix-id")!,
            "svix-timestamp": req.headers.get("svix-timestamp")!,
            "svix-signature": req.headers.get("svix-signature")!,
        };

        const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

        const { type, data } = clerkWebhookSchema.parse(
            wh.verify(JSON.stringify(payload), headers)
        );

        switch (type) {
            case "user.created":
                {
                    const webhookUser = userWebhookSchema.parse(data);

                    const email = webhookUser.email_addresses.find(
                        (e) => e.id === webhookUser.primary_email_address_id
                    )!;
                    const phone = webhookUser.phone_numbers.find(
                        (p) => p?.id === webhookUser.primary_phone_number_id
                    );

                    await db.insert(users).values({
                        id: webhookUser.id,
                        firstName: webhookUser.first_name,
                        lastName: webhookUser.last_name,
                        email: email.email_address,
                        phone: phone?.phone_number ?? null,
                        avatarUrl: webhookUser.image_url,
                        isEmailVerified:
                            email.verification?.status === "verified",
                        isPhoneVerified:
                            phone?.verification?.status === "verified",
                        createdAt: webhookUser.created_at,
                        updatedAt: webhookUser.updated_at,
                    });
                }
                break;

            case "user.updated":
                {
                    const webhookUser = userWebhookSchema.parse(data);

                    const email = webhookUser.email_addresses.find(
                        (e) => e.id === webhookUser.primary_email_address_id
                    )!;
                    const phone = webhookUser.phone_numbers.find(
                        (p) => p?.id === webhookUser.primary_phone_number_id
                    );

                    await Promise.all([
                        db
                            .update(users)
                            .set({
                                firstName: webhookUser.first_name,
                                lastName: webhookUser.last_name,
                                email: email.email_address,
                                phone: phone?.phone_number ?? null,
                                avatarUrl: webhookUser.image_url,
                                isEmailVerified:
                                    email.verification?.status === "verified",
                                isPhoneVerified:
                                    phone?.verification?.status === "verified",
                                updatedAt: webhookUser.updated_at,
                            })
                            .where(eq(users.id, webhookUser.id)),
                        cache.user.remove(webhookUser.id),
                    ]);
                }
                break;

            case "user.deleted":
                {
                    const { id } = userDeleteWebhookSchema.parse(data);

                    await Promise.all([
                        db.delete(users).where(eq(users.id, id)),
                        cache.user.remove(id),
                    ]);
                }
                break;
        }

        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}
