import { categoryCache, productTypeCache, subcategoryCache } from "./category";
import { mediaItemCache } from "./media-item";
import { userCache } from "./user";

export const cache = {
    category: categoryCache,
    productType: productTypeCache,
    subcategory: subcategoryCache,
    mediaItem: mediaItemCache,
    user: userCache,
};
