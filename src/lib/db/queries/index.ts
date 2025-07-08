import {
    categoryQueries,
    productTypeQueries,
    subcategoryQueries,
} from "./category";
import { mediaItemQueries } from "./media-item";
import { userQueries } from "./user";

export const queries = {
    category: categoryQueries,
    productType: productTypeQueries,
    subcategory: subcategoryQueries,
    mediaItem: mediaItemQueries,
    user: userQueries,
};
