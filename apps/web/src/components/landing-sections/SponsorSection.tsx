"use client";

import React from "react";
import { trpc } from "@/lib/trpc";
import { SponsorCard } from "@/components/sponsor/SponsorCard";
import Link from "next/link";

const SponsorSection = () => {
  const { data: sponsors, isLoading } =
    trpc.sponsor.getActiveSponsors.useQuery();

  if (isLoading) {
    return null; // Or a skeleton
  }

  // If no sponsors, show placeholder or nothing?
  // User said: "If no sponsors → show 'your ad here' placeholder"

  const hasSponsors = sponsors && sponsors.length > 0;

  return (
    <section className="w-full py-20 px-4 md:px-8 border-b border-[#252525] bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Our Sponsors
          </h2>
          <p className="text-neutral-400">
            Supported by these amazing companies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hasSponsors &&
            sponsors.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}

          {/* Placeholder slot if less than 3 sponsors or always show one? */}
          {/* User said: "If no sponsors -> show 'your ad here' placeholder" */}
          {/* Let's show a placeholder if we have fewer than 3 sponsors, or at least one if none */}

          {(!hasSponsors || sponsors.length < 3) && (
            <Link href="/sponsor" className="group block h-full">
              <div className="aspect-[16/10] w-full h-full rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 hover:bg-neutral-900/40 hover:border-neutral-700 transition-all duration-300 flex flex-col items-center justify-center gap-3 p-6">
                <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-neutral-500">+</span>
                </div>
                <div className="text-center">
                  <h3 className="text-neutral-400 font-medium group-hover:text-white transition-colors">
                    Become a Sponsor
                  </h3>
                  <p className="text-neutral-600 text-sm mt-1">
                    Your logo here
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default SponsorSection;
