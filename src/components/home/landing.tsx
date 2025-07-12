"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import { Icons } from "../icons";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";

const banners = [
    {
        title: "Wear Product You Value",
        description: "Discover our curated collection of sustainable fashion.",
        imageUrl:
            "https://plus.unsplash.com/premium_photo-1677995700941-100976883af7?q=80&w=1500&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        title: "Trace Your Product Journey",
        description: "Learn about the journey of each product you wear.",
        imageUrl:
            "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNob3B8ZW58MHx8MHx8fDA%3D",
    },
    {
        title: "Know Your Impact",
        description: "Understand the environmental impact of your choices.",
        imageUrl:
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1500&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        title: "Choose Consciously",
        description: "Make informed decisions for a better future.",
        imageUrl:
            "https://plus.unsplash.com/premium_photo-1673977133409-b5c2ff90c9b6?w=1500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHNob3B8ZW58MHx8MHx8fDA%3D",
    },
];

export function Landing({ className, ...props }: GenericProps) {
    return (
        <section className={cn("", className)} {...props}>
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                        delay: 5000,
                    }),
                ]}
                className="h-[calc(100vh-20vh)] w-full"
            >
                <CarouselContent
                    classNames={{
                        wrapper: "size-full",
                        inner: "size-full ml-0",
                    }}
                >
                    {banners.map((item, index) => (
                        <CarouselItem key={index} className="h-full p-0">
                            <div className="relative size-full">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    width={2000}
                                    height={2000}
                                    className="size-full object-cover brightness-50"
                                    priority={index === 0}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-5 p-4 text-center text-background md:space-y-10">
                                    <h1 className="max-w-3xl text-3xl font-bold text-balance uppercase md:text-5xl lg:text-7xl">
                                        {item.title}
                                    </h1>

                                    <p className="max-w-xl text-balance text-background/80 md:text-lg lg:max-w-3xl lg:text-2xl">
                                        {item.description}
                                    </p>

                                    <Button
                                        size="lg"
                                        className="mt-1 bg-background/60 font-semibold text-foreground uppercase hover:bg-background/90 md:mt-0 md:py-5"
                                        asChild
                                    >
                                        <Link href="/shop">Discover More</Link>
                                    </Button>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            <Marquee autoFill speed={100}>
                <p className="text-sm">Wear Product You Value</p>
                <Icons.Heart className="size-3 fill-background md:size-4" />

                <p className="text-sm">Trace Your Product Journey</p>
                <Icons.Heart className="size-3 fill-background md:size-4" />

                <p className="text-sm">Know Your Impact</p>
                <Icons.Heart className="size-3 fill-background md:size-4" />

                <p className="text-sm">Choose Consciously</p>
                <Icons.Heart className="size-3 fill-background md:size-4" />
            </Marquee>
        </section>
    );
}
