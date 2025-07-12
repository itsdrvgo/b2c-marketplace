"use client";

import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/lib/react-query";
import { useNavbarStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useState } from "react";

export function NavbarHome() {
    const [isMenuHidden, setIsMenuHidden] = useState(false);

    const isMenuOpen = useNavbarStore((state) => state.isOpen);
    const setIsMenuOpen = useNavbarStore((state) => state.setIsOpen);

    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;

        if (latest > previous && latest > 150) setIsMenuHidden(true);
        else setIsMenuHidden(false);
    });

    const { useCurrentUser, useLogout } = useAuth();
    const { data: user } = useCurrentUser();
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

    return (
        <motion.header
            variants={{
                visible: {
                    y: 0,
                },
                hidden: {
                    y: "-100%",
                },
            }}
            animate={isMenuHidden ? "hidden" : "visible"}
            transition={{
                duration: 0.35,
                ease: "easeInOut",
            }}
            className="sticky inset-x-0 top-0 z-50 flex h-auto w-full items-center justify-center bg-background"
            data-menu-open={isMenuOpen}
        >
            <nav
                className={cn(
                    "relative z-10 flex w-full max-w-5xl items-center justify-between gap-5 overflow-hidden p-4 md:px-8 xl:max-w-[100rem]",
                    isMenuOpen && "border-b"
                )}
            >
                <Link
                    href="/"
                    className="flex items-center gap-2 text-2xl font-bold"
                >
                    <p className="text-xl font-bold md:text-2xl">
                        {siteConfig.name}
                    </p>
                </Link>

                <div className="flex items-center gap-6">
                    <ul className="hidden items-center gap-1 sm:flex">
                        {!!siteConfig.menu.length &&
                            siteConfig.menu.map((item, index) => (
                                <li key={index}>
                                    <Link
                                        className="relative rounded-lg p-1.5 px-4 font-semibold transition-all ease-in-out hover:bg-muted"
                                        href={item.href}
                                        target={
                                            item.isExternal
                                                ? "_blank"
                                                : undefined
                                        }
                                        referrerPolicy={
                                            item.isExternal ? "no-referrer" : ""
                                        }
                                    >
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                    </ul>

                    <div className="flex items-center gap-6">
                        <button
                            aria-label="Mobile Menu Toggle Button"
                            aria-pressed={isMenuOpen}
                            className="sm:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Icons.Menu className="size-6" />
                        </button>

                        {user ? (
                            <div className="hidden items-center gap-5 md:flex">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button>
                                            <Avatar>
                                                <AvatarImage
                                                    src={user.avatarUrl ?? ""}
                                                    alt={user.firstName}
                                                />
                                                <AvatarFallback>
                                                    {user.firstName[0]}
                                                </AvatarFallback>
                                            </Avatar>

                                            <span className="sr-only">
                                                User menu
                                            </span>
                                        </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent className="min-w-56">
                                        <DropdownMenuLabel className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage
                                                    src={user.avatarUrl ?? ""}
                                                    alt={user.firstName}
                                                />
                                                <AvatarFallback>
                                                    {user.firstName[0]}
                                                </AvatarFallback>
                                            </Avatar>

                                            <p>
                                                Hello,{" "}
                                                <span className="font-semibold">
                                                    {user.firstName}
                                                </span>
                                            </p>
                                        </DropdownMenuLabel>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuGroup>
                                            {user.role !== "user" && (
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href="/dashboard"
                                                        prefetch
                                                    >
                                                        <Icons.LayoutDashboard className="size-4" />
                                                        <span>Dashboard</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuItem asChild>
                                                <Link href="/contact">
                                                    <Icons.LifeBuoy className="size-4" />
                                                    <span>Contact Us</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuGroup>
                                            <DropdownMenuItem asChild>
                                                <Link href="/profile">
                                                    <Icons.User2 className="size-4" />
                                                    <span>Profile</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            disabled={isLoggingOut}
                                            onClick={() => logout()}
                                        >
                                            <Icons.LogOut className="size-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <Button
                                asChild
                                className="hidden rounded-lg bg-foreground px-8 text-sm shadow-[inset_1px_1px_10px_2px_rgba(0,0,0,0.2),inset_2px_0_0_0_rgba(255,255,255,0.2)] md:flex"
                            >
                                <Link href="/auth/signin">Login</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </nav>
        </motion.header>
    );
}
