"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SponsorForm } from "@/components/sponsor/SponsorForm";

const SponsorSubmitPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("paymentId");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!paymentId) {
      // If no payment ID, redirect back to sponsor page
      // router.push("/sponsor");
    }
  }, [paymentId, router]);

  if (!mounted) return null;

  if (!paymentId) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 px-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Missing Payment Information</h1>
        <p className="text-neutral-400 mb-8">
          Please complete the payment process first.
        </p>
        <button
          onClick={() => router.push("/sponsor")}
          className="bg-[#4dd0a4] text-black font-bold py-2 px-6 rounded-lg"
        >
          Go to Sponsor Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
          Thank you for your sponsorship!
        </h1>
        <p className="text-base md:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Please complete the form below with your company details. Your
          sponsorship will go live within 2-3 business days.
        </p>
      </div>
      <SponsorForm razorpayPaymentId={paymentId} />
    </div>
  );
};

export default SponsorSubmitPage;
