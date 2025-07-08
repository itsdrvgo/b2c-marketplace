import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../helper";
import { products } from "./product";

export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().notNull().unique().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    ...timestamps,
});

export const subcategories = pgTable("subcategories", {
    id: uuid("id").primaryKey().notNull().unique().defaultRandom(),
    categoryId: uuid("category_id")
        .notNull()
        .references(() => categories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    ...timestamps,
});

export const productTypes = pgTable("product_types", {
    id: uuid("id").primaryKey().notNull().unique().defaultRandom(),
    categoryId: uuid("category_id")
        .notNull()
        .references(() => categories.id, { onDelete: "cascade" }),
    subcategoryId: uuid("subcategory_id")
        .notNull()
        .references(() => subcategories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    ...timestamps,
});

export const categoriesRelations = relations(categories, ({ many }) => ({
    subcategories: many(subcategories),
    productTypes: many(productTypes),
}));

export const subcategoriesRelations = relations(
    subcategories,
    ({ one, many }) => ({
        category: one(categories, {
            fields: [subcategories.categoryId],
            references: [categories.id],
        }),
        productTypes: many(productTypes),
    })
);

export const productTypesRelations = relations(
    productTypes,
    ({ one, many }) => ({
        subcategory: one(subcategories, {
            fields: [productTypes.subcategoryId],
            references: [subcategories.id],
        }),
        category: one(categories, {
            fields: [productTypes.categoryId],
            references: [categories.id],
        }),
        products: many(products),
    })
);
