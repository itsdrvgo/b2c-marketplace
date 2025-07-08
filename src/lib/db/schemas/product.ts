import { ProductMedia, ProductOptionValue } from "@/lib/validations";
import { relations, sql } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "../helper";
import { categories, productTypes, subcategories } from "./category";
import { users } from "./user";

export const products = pgTable(
    "products",
    {
        // BASIC
        id: uuid("id").primaryKey().notNull().unique().defaultRandom(),
        title: text("title").notNull(),
        slug: text("slug").notNull().unique(),
        description: text("description"),
        uploaderId: text("uploader_id").references(() => users.id, {
            onDelete: "set null",
        }),
        isAvailable: boolean("is_available").default(true).notNull(),
        isActive: boolean("is_active").default(true).notNull(),
        isPublished: boolean("is_published").default(false).notNull(),
        publishedAt: timestamp("published_at"),
        media: jsonb("media").$type<ProductMedia[]>().default([]).notNull(),
        productHasVariants: boolean("product_has_variants")
            .default(false)
            .notNull(),

        // CATEGORY
        categoryId: uuid("category_id")
            .notNull()
            .references(() => categories.id, { onDelete: "cascade" }),
        subcategoryId: uuid("subcategory_id")
            .notNull()
            .references(() => subcategories.id, { onDelete: "cascade" }),
        productTypeId: uuid("product_type_id")
            .notNull()
            .references(() => productTypes.id, { onDelete: "cascade" }),

        // PRICING
        price: integer("price"),
        compareAtPrice: integer("compare_at_price"),
        costPerItem: integer("cost_per_item"),

        // INVENTORY
        nativeSku: text("native_sku"),
        sku: text("sku"),
        barcode: text("barcode"),
        quantity: integer("quantity"),

        // SHIPPING
        weight: integer("weight"),
        length: integer("length"),
        width: integer("width"),
        height: integer("height"),
        originCountry: text("origin_country"),
        hsCode: text("hs_code"),

        // SEO
        metaTitle: text("meta_title"),
        metaDescription: text("meta_description"),
        metaKeywords: text("meta_keywords").array().default([]),

        // OTHER
        isDeleted: boolean("is_deleted").default(false).notNull(),
        deletedAt: timestamp("deleted_at"),
        ...timestamps,
    },
    (table) => ({
        productSkuIdx: index("product_sku_idx").on(table.sku),
        productFtsIdx: index("product_fts_idx").using(
            "gin",
            sql`(
            setweight(to_tsvector('english', ${table.title}), 'A') ||
            setweight(to_tsvector('english', ${table.description}), 'B')
        )`
        ),
    })
);

export const productOptions = pgTable(
    "product_options",
    {
        id: uuid("id").primaryKey().notNull().unique().defaultRandom(),
        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        values: jsonb("values")
            .$type<ProductOptionValue[]>()
            .default([])
            .notNull(),
        position: integer("position").default(0).notNull(),
        isDeleted: boolean("is_deleted").default(false).notNull(),
        deletedAt: timestamp("deleted_at"),
        ...timestamps,
    },
    (table) => ({
        productOptionProductIdIdx: index("product_option_product_id_idx").on(
            table.productId
        ),
    })
);

export const productVariants = pgTable(
    "product_variants",
    {
        // BASIC INFO
        id: uuid("id").primaryKey().notNull().unique().defaultRandom(),
        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "cascade" }),
        image: text("image"),
        combinations: jsonb("combinations").default({}).notNull(),

        // PRICING
        price: integer("price").notNull(),
        compareAtPrice: integer("compare_at_price"),
        costPerItem: integer("cost_per_item"),

        // INVENTORY
        nativeSku: text("native_sku").notNull().unique(),
        sku: text("sku"),
        barcode: text("barcode"),
        quantity: integer("quantity").notNull().default(0),

        // SHIPPING
        weight: integer("weight").notNull().default(0),
        length: integer("length").notNull().default(0),
        width: integer("width").notNull().default(0),
        height: integer("height").notNull().default(0),
        originCountry: text("origin_country"),
        hsCode: text("hs_code"),
        isDeleted: boolean("is_deleted").default(false).notNull(),
        deletedAt: timestamp("deleted_at"),
        ...timestamps,
    },
    (table) => ({
        productVariantProductIdIdx: index("product_variant_product_id_idx").on(
            table.productId
        ),
        productVariantSkuIdx: index("product_variant_sku_idx").on(table.sku),
    })
);

export const productsRelations = relations(products, ({ one, many }) => ({
    options: many(productOptions),
    variants: many(productVariants),
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    subcategory: one(subcategories, {
        fields: [products.subcategoryId],
        references: [subcategories.id],
    }),
    productType: one(productTypes, {
        fields: [products.productTypeId],
        references: [productTypes.id],
    }),
}));

export const productOptionsRelations = relations(productOptions, ({ one }) => ({
    product: one(products, {
        fields: [productOptions.productId],
        references: [products.id],
    }),
}));

export const productVariantsRelations = relations(
    productVariants,
    ({ one }) => ({
        product: one(products, {
            fields: [productVariants.productId],
            references: [products.id],
        }),
    })
);
