import type { NextConfig } from "next";
import "./env";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "x6bo3x9qkp.ufs.sh",
                pathname: "/f/**",
            },
        ],
    },
};

export default nextConfig;
