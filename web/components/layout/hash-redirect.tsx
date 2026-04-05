"use client";

import { useEffect } from "react";

/** Static-export friendly redirect to home with a hash (legacy routes). */
export function HashRedirect({ hash }: { hash: string }) {
  useEffect(() => {
    const frag = hash.replace(/^#/, "");
    window.location.replace(`/#${frag}`);
  }, [hash]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-zinc-500">
      Redirecting to lab overview…
    </div>
  );
}
