"use client";

import React, { useEffect, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { redirect } from "next/navigation";
import CheckoutConfirmation from "./checkout-confirmation";

export default function CheckoutWrapper() {
  const { isPaidUser, isLoading, refetch } = useSubscription();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !isPaidUser && retryCount < 3) {
      const timer = setTimeout(() => {
        refetch?.();
        setRetryCount((prev) => prev + 1);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isPaidUser, isLoading, retryCount, refetch]);

  if (isLoading || (!isPaidUser && retryCount < 3)) {
    return (
      <div className="flex flex-col h-screen w-full justify-center items-center">
        <div className="text-white text-xl">
          {retryCount > 0 ? "Verifying payment..." : "Loading..."}
        </div>
      </div>
    );
  }

  if (!isLoading && !isPaidUser && retryCount >= 3) {
    redirect("/pricing");
  }

  return <CheckoutConfirmation />;
}
