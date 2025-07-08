import type { NextConfig } from "next";
import "./env";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "6kyfi4ef87.ufs.sh",
                pathname: "/f/**",
            },
        ],
    },
};

export default nextConfig;
