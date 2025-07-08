import { env } from "@/../env";
import { Redis } from "ioredis";

export const redis = new Redis(env.REDIS_URL);

export async function getAllKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = "0";
    do {
        const [nextCursor, scanKeys] = await redis.scan(
            cursor,
            "MATCH",
            pattern,
            "COUNT",
            "1000"
        );
        cursor = nextCursor;
        keys.push(...scanKeys);
    } while (cursor !== "0");

    return keys;
}
