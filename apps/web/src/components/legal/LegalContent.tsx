import React from "react";

interface LegalContentProps {
  children: React.ReactNode;
}

export function LegalContent({ children }: LegalContentProps) {
  return (
    <div className="space-y-8 text-[#e1e1e1] leading-relaxed">{children}</div>
  );
}

