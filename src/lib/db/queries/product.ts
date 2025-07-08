import { Product } from "@/lib/validations";

class ProductQuery {
    async count({}: {
        uploaderId?: string;
        isDeleted?: boolean;
        isAvailable?: boolean;
        isPublished?: boolean;
        isActive?: boolean;
        verificationStatus?: Product["verificationStatus"];
    }) {}
}

export const productQueries = new ProductQuery();
