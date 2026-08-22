"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const SIGN_UP_CONVERSION_SEND_TO = "AW-18360930332/Cez1CJjvnuYcEJyglrNE";

export default function SignupConversionTracker() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("new_signup") !== "1") return;

    if (typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: SIGN_UP_CONVERSION_SEND_TO,
      });
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("new_signup");
    const query = params.toString();
    router.replace(query ? `/app?${query}` : "/app", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
