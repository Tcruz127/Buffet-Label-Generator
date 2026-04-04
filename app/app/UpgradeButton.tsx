"use client";

import { useState } from "react";

export default function UpgradeButton({
  billingCycle = "monthly",
}: {
  billingCycle?: "monthly" | "annual";
}) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billingCycle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Failed to start checkout.");
    } finally {
      setLoading(false);
    }
  }

  const buttonText =
    billingCycle === "annual" ? "Choose Annual" : "Choose Monthly";

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="inline-flex w-full items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "Redirecting..." : buttonText}
    </button>
  );
}