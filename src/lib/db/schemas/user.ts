import { SITE_ROLES } from "@/config/const";
import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";
import { addresses } from "./address";
import { carts } from "./cart";
import { wishlists } from "./wishlist";

export const users = pgTable("users", {
    id: text("id").primaryKey().notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone").unique(),
    avatarUrl: text("avatar_url"),
    isEmailVerified: boolean("is_email_verified").notNull().default(false),
    isPhoneVerified: boolean("is_phone_verified").notNull().default(false),
    role: text("role", { enum: SITE_ROLES }).notNull().default("user"),
    ...timestamps,
});

export const userAddresses = pgTable(
    "user_addresses",
    {
        id: uuid("id").primaryKey().notNull().unique().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        addressId: uuid("address_id")
            .notNull()
            .references(() => addresses.id, { onDelete: "cascade" }),
        ...timestamps,
    },
    (table) => ({
        userIdIdx: index("user_address_id_idx").on(table.userId),
        addressIdIdx: index("address_id_idx").on(table.addressId),
    })
);

export const userRelations = relations(users, ({ many }) => ({
    addresses: many(addresses),
    wishlists: many(wishlists),
    carts: many(carts),
}));

export const userAddressRelations = relations(userAddresses, ({ one }) => ({
    user: one(users, {
        fields: [userAddresses.userId],
        references: [users.id],
    }),
    address: one(addresses, {
        fields: [userAddresses.addressId],
        references: [addresses.id],
    }),
}));
