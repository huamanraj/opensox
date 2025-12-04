"use client";

import React from "react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

const DashboardSponsorReminder = () => {
  const { data: pendingSponsorship, isLoading } = (
    trpc.sponsor.getPendingSponsorship as any
  ).useQuery();

  if (isLoading || !pendingSponsorship) {
    return null;
  }

  return (
    <div className="w-full mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
        </div>
        <div>
          <h3 className="text-white font-medium">Complete your sponsorship</h3>
          <p className="text-neutral-400 text-sm">
            You have a pending sponsorship payment. Upload your assets to go
            live.
          </p>
        </div>
      </div>
      <Link
        href={`/sponsor/submit?paymentId=${pendingSponsorship.paymentId}`}
        className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg text-sm hover:bg-yellow-400 transition-colors"
      >
        Complete Setup
      </Link>
    </div>
  );
};

export default DashboardSponsorReminder;
