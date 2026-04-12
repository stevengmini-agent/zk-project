"use client";

import { useEffect } from "react";
import { LAYOUT_CONTENT_CLASS } from "@/lib/config/layout";

/** Static-export friendly redirect to home with a hash (legacy routes). */
export function HashRedirect({ hash }: { hash: string }) {
  useEffect(() => {
    const frag = hash.replace(/^#/, "");
    window.location.replace(`/#${frag}`);
  }, [hash]);

  return (
    <div className={`${LAYOUT_CONTENT_CLASS} py-16 text-center text-sm text-zinc-500`}>
      Redirecting to lab overview…
    </div>
  );
}
