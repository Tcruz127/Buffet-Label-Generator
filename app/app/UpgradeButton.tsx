"use client";

import { useState } from "react";

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Failed to start checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="bg-black text-white px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "Redirecting..." : "Upgrade"}
    </button>
  );
}