import {
    categoryQueries,
    productTypeQueries,
    subcategoryQueries,
} from "./category";
import { mediaItemQueries } from "./media-item";
import { productQueries } from "./product";
import { userQueries } from "./user";
import { wishlistQueries } from "./wishlist";

export const queries = {
    category: categoryQueries,
    productType: productTypeQueries,
    subcategory: subcategoryQueries,
    mediaItem: mediaItemQueries,
    product: productQueries,
    user: userQueries,
    wishlist: wishlistQueries,
};
