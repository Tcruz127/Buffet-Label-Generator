"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";

export default function SheetSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q.trim()) {
        params.set("q", q.trim());
      } else {
        params.delete("q");
      }
      // Keep active folder filter if present
      startTransition(() => {
        router.replace(`/app?${params.toString()}`);
      });
    }, 250);
  }

  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
      </svg>
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Search sheets…"
        className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/15"
      />
      {isPending && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />
        </div>
      )}
    </div>
  );
}