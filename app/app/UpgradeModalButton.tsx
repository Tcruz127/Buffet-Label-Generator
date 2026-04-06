"use client";

import { useState } from "react";
import UpgradeModal from "./UpgradeModal";

export default function UpgradeModalButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Upgrade
      </button>

      <UpgradeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
