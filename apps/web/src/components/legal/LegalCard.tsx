import React from "react";
import { cn } from "@/lib/utils";

interface LegalCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "highlighted";
}

export function LegalCard({
  children,
  className = "",
  variant = "default",
}: LegalCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-6",
        variant === "default"
          ? "bg-[#1a1a1a] border border-[#252525]"
          : "bg-[#1a1a1a] border border-[#9455f4]",
        className
      )}
    >
      {children}
    </div>
  );
}

