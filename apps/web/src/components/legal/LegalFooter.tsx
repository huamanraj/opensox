import React from "react";

export function LegalFooter() {
  return (
    <div className="mt-16 pt-8 border-t border-[#252525] text-center text-[#b1b1b1]">
      <p className="text-sm">
        © {new Date().getFullYear()} Opensox AI. All rights reserved.
      </p>
    </div>
  );
}

