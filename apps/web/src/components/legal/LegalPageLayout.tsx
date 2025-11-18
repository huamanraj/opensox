import React from "react";

interface LegalPageLayoutProps {
  children: React.ReactNode;
}

export function LegalPageLayout({ children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#101010] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 lg:py-24">{children}</div>
    </div>
  );
}

