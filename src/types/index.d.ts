import { IncomingHttpHeaders } from "http";
import { LocalIcon } from "@/components/icons";
import { HTMLAttributes, ReactNode } from "react";
import { WebhookRequiredHeaders } from "svix";

declare global {
    type GenericProps = HTMLAttributes<HTMLElement>;
    type LayoutProps = {
        children: ReactNode;
    };

    type SvixHeaders = IncomingHttpHeaders & WebhookRequiredHeaders;

    type SiteConfig = {
        name: string;
        description: string;
        longDescription?: string;
        category: string;
        og: {
            url: string;
            width: number;
            height: number;
        };
        developer: {
            name: string;
            url: string;
        };
        keywords: string[];
        links?: Partial<Record<LocalIcon, string>>;
        contact: string;
        menu: {
            name: string;
            href: string;
            icon: LocalIcon;
            isExternal?: boolean;
            isDisabled?: boolean;
        }[];
        sidebar: {
            title: string;
            url: string;
            icon: LocalIcon;
            items: {
                title: string;
                url: string;
                isDisabled?: boolean;
            }[];
        }[];
    };
}
