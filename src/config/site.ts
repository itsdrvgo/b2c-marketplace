import { getAbsoluteURL } from "@/lib/utils";

export const siteConfig: SiteConfig = {
    name: "B2C Marketplace",
    description:
        "A platform for buying and selling digital products and services.",
    longDescription:
        "B2C Marketplace is a comprehensive platform designed to facilitate the buying and selling of digital products and services. Our marketplace connects freelancers with clients, providing a seamless experience for managing projects, payments, and communication.",
    keywords: [
        "B2C Marketplace",
        "digital products",
        "digital services",
        "freelancers",
        "clients",
        "project management",
        "payment processing",
        "communication tools",
    ],
    category: "Marketplace",
    developer: {
        name: "DRVGO",
        url: "https://itsdrvgo.me/",
    },
    og: {
        url: getAbsoluteURL("/og.webp"),
        width: 1200,
        height: 630,
    },
    links: {
        Twitter: "https://x.com/itsdrvgo",
        Instagram: "https://www.instagram.com/itsdrvgo",
        Github: "https://github.com/itsdrvgo",
        Youtube: "https://youtube.com/@itsdrvgodev",
        Discord: "https://itsdrvgo.me/support",
    },
    contact: "contact@freveo.com",
    menu: [
        {
            name: "Shop",
            href: "/shop",
            icon: "Store",
        },
        {
            name: "Support",
            href: "/support",
            icon: "LifeBuoy",
        },
    ],
    sidebar: [],
};
