"use client";

import React, { useEffect, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { redirect } from "next/navigation";
import CheckoutConfirmation from "./checkout-confirmation";

export default function CheckoutWrapper() {
  const { isPaidUser, isLoading, refetch } = useSubscription();
  const [retryCount, setRetryCount] = useState(0);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Retry fetching subscription status after payment
  // Payment processing might take a few seconds
  useEffect(() => {
    if (!isLoading && !isPaidUser && retryCount < 3) {
      const timer = setTimeout(() => {
        refetch?.();
        setRetryCount((prev) => prev + 1);
      }, 2000); // Retry every 2 seconds

      return () => clearTimeout(timer);
    }

    // After 3 retries (6 seconds), if still not paid, redirect
    if (!isLoading && !isPaidUser && retryCount >= 3) {
      setShouldRedirect(true);
    }
  }, [isPaidUser, isLoading, retryCount, refetch]);

  // Show loading state while checking subscription or retrying
  if (isLoading || (!isPaidUser && retryCount < 3)) {
    return (
      <div className="flex flex-col h-screen w-full justify-center items-center">
        <div className="text-white text-xl">
          {retryCount > 0 ? "Verifying payment..." : "Loading..."}
        </div>
      </div>
    );
  }

  // Redirect to pricing if not a paid user after retries
  if (shouldRedirect && !isPaidUser) {
    redirect("/pricing");
  }

  // Show checkout confirmation for paid users
  return <CheckoutConfirmation />;
}
