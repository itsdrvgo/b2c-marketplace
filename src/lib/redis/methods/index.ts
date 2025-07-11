import { cartCache } from "./cart";
import { categoryCache, productTypeCache, subcategoryCache } from "./category";
import { mediaItemCache } from "./media-item";
import { userCache } from "./user";
import { wishlistCache } from "./wishlist";

export const cache = {
    cart: cartCache,
    category: categoryCache,
    productType: productTypeCache,
    subcategory: subcategoryCache,
    mediaItem: mediaItemCache,
    user: userCache,
    wishlist: wishlistCache,
};
