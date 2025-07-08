import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";
import { users } from "./user";

export const mediaItems = pgTable(
    "media_items",
    {
        id: uuid("id").primaryKey().notNull().unique().defaultRandom(),
        uploaderId: text("uploader_id").references(() => users.id, {
            onDelete: "set null",
        }),
        url: text("url").notNull(),
        type: text("type").notNull(),
        name: text("name").notNull(),
        alt: text("alt"),
        size: integer("size").notNull(),
        ...timestamps,
    },
    (table) => ({
        mediaItemUploaderIdIdx: index("media_item_uploader_id_idx").on(
            table.uploaderId
        ),
    })
);

export const mediaItemRelations = relations(mediaItems, ({ one }) => ({
    uploader: one(users, {
        fields: [mediaItems.uploaderId],
        references: [users.id],
    }),
}));
