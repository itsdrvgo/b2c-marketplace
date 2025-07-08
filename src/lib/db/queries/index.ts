import {
    categoryQueries,
    productTypeQueries,
    subcategoryQueries,
} from "./category";
import { userQueries } from "./user";

export const queries = {
    category: categoryQueries,
    productType: productTypeQueries,
    subcategory: subcategoryQueries,
    user: userQueries,
};
