import { ERROR_MESSAGES } from "@/config/const";
import { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { NextResponse } from "next/server";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import {
    ProductOption,
    ProductVariant,
    ProductVariantGroup,
    ResponseMessages,
} from "./validations";

export function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getAbsoluteURL(path: string = "/") {
    if (process.env.NEXT_PUBLIC_DEPLOYMENT_URL)
        return `https://${process.env.NEXT_PUBLIC_DEPLOYMENT_URL}${path}`;
    else if (process.env.VERCEL_URL)
        return `https://${process.env.VERCEL_URL}${path}`;
    return "http://localhost:3000" + path;
}

export class AppError extends Error {
    status: ResponseMessages;

    constructor(message: string, status: ResponseMessages = "BAD_REQUEST") {
        super(message);
        this.name = "AppError";
        this.status = status;
    }
}

export function sanitizeError(error: unknown): string {
    if (error instanceof AppError) return error.message;
    else if (error instanceof AxiosError)
        return (
            error.response?.data?.longMessage ??
            error.response?.data?.message ??
            error.message
        );
    else if (error instanceof ZodError)
        return error.issues.map((x) => x.message).join(", ");
    else if (error instanceof Error) return error.message;
    else return ERROR_MESSAGES.GENERIC;
}

export function handleError(error: unknown) {
    if (error instanceof AppError)
        return CResponse({
            message: error.status,
            longMessage: sanitizeError(error),
        });
    else if (error instanceof AxiosError)
        return CResponse({
            message: "INTERNAL_SERVER_ERROR",
            longMessage: sanitizeError(error),
        });
    else if (error instanceof ZodError)
        return CResponse({
            message: "BAD_REQUEST",
            longMessage: sanitizeError(error),
        });
    else if (error instanceof Error)
        return CResponse({
            message: "INTERNAL_SERVER_ERROR",
            longMessage: error.message,
        });
    else return CResponse({ message: "INTERNAL_SERVER_ERROR" });
}

export function CResponse<T>({
    message = "OK",
    longMessage,
    data,
}: {
    message?: ResponseMessages;
    longMessage?: string;
    data?: T;
} = {}) {
    let code: number;
    let success = false;

    switch (message) {
        case "OK":
            success = true;
            code = 200;
            break;
        case "CREATED":
            success = true;
            code = 201;
            break;
        case "BAD_REQUEST":
            code = 400;
            break;
        case "ERROR":
            code = 400;
            break;
        case "UNAUTHORIZED":
            code = 401;
            break;
        case "FORBIDDEN":
            code = 403;
            break;
        case "NOT_FOUND":
            code = 404;
            break;
        case "CONFLICT":
            code = 409;
            break;
        case "TOO_MANY_REQUESTS":
            code = 429;
            break;
        case "UNPROCESSABLE_ENTITY":
            code = 422;
            break;
        case "INTERNAL_SERVER_ERROR":
            code = 500;
            break;
        case "UNKNOWN_ERROR":
            code = 500;
            break;
        case "NOT_IMPLEMENTED":
            code = 501;
            break;
        case "BAD_GATEWAY":
            code = 502;
            break;
        case "SERVICE_UNAVAILABLE":
            code = 503;
            break;
        case "GATEWAY_TIMEOUT":
            code = 504;
            break;
        default:
            code = 500;
            break;
    }

    return NextResponse.json(
        { success, longMessage, data },
        { status: code, statusText: message }
    );
}

export function handleClientError(error: unknown, toastId?: string | number) {
    return toast.error(sanitizeError(error), { id: toastId });
}

export function parseToJSON<T>(data?: string | null): T | null {
    if (!data) return null;
    return JSON.parse(data);
}

export function slugify(text: string, separator: string = "-") {
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, separator);
}

export function convertValueToLabel(value: string) {
    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .split(/[_-\s]/)
        .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
        .join(" ");
}

export function convertEmptyStringToNull(data: unknown) {
    return typeof data === "string" && data === "" ? null : data;
}

export function generateProductSlug(productName: string) {
    return slugify(
        `${productName} ${Date.now()} ${Math.random().toString(36).substring(7)}`
    );
}

export function generateCacheKey({
    separator = "::",
    prefix,
}: {
    separator?: string;
    prefix?: string;
} = {}) {
    const createRedisKey = (...args: string[]): string => {
        return args.join(separator);
    };

    if (prefix)
        return (...args: string[]): string => {
            return createRedisKey(prefix, ...args);
        };

    return createRedisKey;
}

export function generateCustomCacheKey(
    keys: (string | undefined)[],
    prefix: string,
    separator = "::"
) {
    return (
        prefix +
        separator +
        keys
            .map((k) => k ?? "*")
            .filter(Boolean)
            .join(separator)
    );
}

export function convertDollarToCent(dollar: number) {
    return Math.round(dollar * 100);
}

export function convertCentToDollar(cent: number) {
    return +(cent / 100).toFixed(2);
}

export function formatPriceTag(price: number, keepDeciamls = false) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: keepDeciamls ? 2 : 0,
    }).format(price);
}

export function generateUploadThingUrl(key: string) {
    return `https://x6bo3x9qkp.ufs.sh/f/${key}`;
}

export function generateSKU(
    opts: {
        prefix?: string;
        separator?: string;
        category?: string;
        subcategory?: string;
        productType?: string;
        options?: {
            name: string;
            value: string;
        }[];
    } = {}
) {
    if (!opts.prefix) opts.prefix = "RN";
    if (!opts.separator) opts.separator = "-";

    const sku = [opts.prefix];

    if (opts.category) sku.push(opts.category.slice(0, 3));
    if (opts.subcategory) sku.push(opts.subcategory.slice(0, 3));
    if (opts.productType) sku.push(opts.productType.slice(0, 3));

    if (opts.options) {
        for (const option of opts.options) {
            const optionName = option.name.slice(0, 1);
            const optionValue = option.value;
            sku.push(`${optionName}${optionValue}`);
        }
    }

    const random = Math.random().toString(36).substring(7);
    sku.push(random);

    return sku.join(opts.separator).toUpperCase();
}

export function generateCombinations(
    options: ProductOption[]
): Record<string, string>[] {
    if (options.length === 0) return [];

    const combinations: Record<string, string>[] = [];
    const optionArrays = options.map((option) =>
        option.values.map((value) => ({
            [option.id]: value.id,
            optionName: option.name,
            valueName: value.name,
        }))
    );

    function combine(current: Record<string, string>, depth: number) {
        if (depth === options.length) {
            combinations.push(current);
            return;
        }

        optionArrays[depth].forEach((option) => {
            combine(
                {
                    ...current,
                    [Object.keys(option)[0]]: option[Object.keys(option)[0]],
                },
                depth + 1
            );
        });
    }

    combine({}, 0);
    return combinations;
}

export function groupVariants(
    variants: ProductVariant[],
    groupBy: string
): ProductVariantGroup[] {
    const groups = new Map<string, ProductVariantGroup>();

    variants.forEach((variant) => {
        const key = variant.combinations[groupBy];
        if (!groups.has(key)) {
            groups.set(key, {
                key,
                value: key,
                variants: [],
                totalQuantity: 0,
            });
        }
        const group = groups.get(key)!;
        group.variants.push(variant);
        group.totalQuantity += variant.quantity;
    });

    return Array.from(groups.values());
}

export function isValidUrl(url: string) {
    return /^https?:\/\/\S+$/.test(url);
}

export function getUrlFromString(str: string) {
    if (isValidUrl(str)) return str;
    if (str.includes(".") && !str.includes(" "))
        return new URL(`https://${str}`).toString();
    return null;
}

export function sanitizeHtml(html: string) {
    return html.replace(/<[^>]*>?/gm, "");
}
