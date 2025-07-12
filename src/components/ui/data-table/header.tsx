"use client";

import * as React from "react";

interface HeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function Header({ children, className = "" }: HeaderProps) {
    return <div className={`mb-4 ${className}`}>{children}</div>;
}
