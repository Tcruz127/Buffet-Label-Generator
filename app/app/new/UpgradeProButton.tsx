"use client";

import { useState } from "react";
import UpgradeModal from "../UpgradeModal";

export default function UpgradeProButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
      >
        Upgrade to Pro
      </button>

      <UpgradeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
