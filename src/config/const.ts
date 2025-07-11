export const DEFAULT_PRODUCT_PAGINATION_LIMIT = 20;
export const DEFAULT_PRODUCT_PAGINATION_PAGE = 1;

export const DEFAULT_PAGINATION_LIMIT = 10;
export const DEFAULT_PAGINATION_PAGE = 1;

export const ERROR_MESSAGES = {
    GENERIC: "An unexpected error occurred. Please try again later",
    UNAUTHORIZED: "You are not authorized to perform this action",
    FORBIDDEN: "You do not have permission to access this resource",
    CONFLICT:
        "The request could not be completed due to a conflict with the current state of the resource",
    BAD_REQUEST:
        "The request could not be understood or was missing required parameters",
    NOT_FOUND: "The requested resource was not found",
    USER_NOT_FOUND: "User not found",
    PRODUCT_ALREADY_IN_WISHLIST: "Product already in wishlist",
    PRODUCT_NOT_FOUND: "Product not found",
} as const;

export const SITE_ROLES = ["user", "mod", "admin"] as const;

export const PRODUCT_VERIFICATION_STATUSES = [
    "idle",
    "pending",
    "approved",
    "rejected",
] as const;

export const REDIS_RETENTIONS = {
    "1d": 60 * 60 * 24,
    "3d": 60 * 60 * 24 * 3,
    "1w": 60 * 60 * 24 * 7,
    "1m": 60 * 60 * 24 * 30,
    "3m": 60 * 60 * 24 * 90,
    "6m": 60 * 60 * 24 * 180,
    "1y": 60 * 60 * 24 * 365,
} as const;
