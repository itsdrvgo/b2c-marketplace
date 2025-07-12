"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";
import * as React from "react";

interface RatingFilterProps {
    value?: number;
    onChange: (value: number | undefined) => void;
    title?: string;
}

export function RatingFilter({
    value,
    onChange,
    title = "Rating",
}: RatingFilterProps) {
    // Create a list of rating options (1-5 stars)
    const ratings = [
        { label: "All ratings", value: "all" },
        { label: "5 stars", value: "5" },
        { label: "4+ stars", value: "4" },
        { label: "3+ stars", value: "3" },
        { label: "2+ stars", value: "2" },
        { label: "1+ stars", value: "1" },
    ];

    const selectedValue = value ? value.toString() : "all";

    return (
        <Select
            value={selectedValue}
            onValueChange={(newValue) => {
                onChange(newValue === "all" ? undefined : Number(newValue));
            }}
        >
            <SelectTrigger className="h-8 w-[150px]">
                <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <SelectValue placeholder={title}>
                        {value ? `${value}+ stars` : "All ratings"}
                    </SelectValue>
                </div>
            </SelectTrigger>
            <SelectContent>
                {ratings.map((rating) => (
                    <SelectItem key={rating.value} value={rating.value}>
                        {rating.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
