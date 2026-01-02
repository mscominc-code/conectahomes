"use client";

import { useEffect, useMemo, useState } from "react";
import { BRAND_NAME, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/utils";
import { gaEvent } from "@/lib/ga";

export default function Header() {
  const [savedZip, setSavedZip] = useState<string>("");

  const readZip = () => {
    try {
      const z = localStorage.getItem("ck_zip") ?? "";
      setSavedZip(/^\d{5}$/.test(z) ? z : "");
    } catch {
      setSavedZip("");
    }
  };

  useEffect(() => {
    readZip();
    const onUpdate = () => readZip();
    window.addEventListener("ck_zip_updated", onUpdate);
    return () => window.removeEventListener("ck_zip_updated", onUpdate);
  }, []);

  const compareHref = useMemo(
    () => (savedZip ? `/compare?zip=${savedZip}` : "/compare"),
    [savedZip]
  );

  return (
    <div className="sticky top-0 z-40 border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* ===== Logo / Brand ===== */}
        <div className="flex items-center gap-3">
          <div className="text-lg font-extrabold text-ckNavy">
            {BRAND_NAME}
          </div>

          <span className="hidden text-xs text-slate-500 md:inline">
            Internet y móvil en EE.UU.
          </span>

          {savedZip && (
            <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 md:inline">
              ZIP {savedZip}
            </span>
          )}
        </div>

        {/* ===== Navigation / CTA ===== */}
        <div className="flex items-center gap-3">
          <a
            className="text-sm font-semibold text-slate-600 hover:underline"
            href={compareHref}
          >
            Comparar planes
          </a>

          <a
            href={`tel:${SUPPORT_PHONE_TEL}`}
            onClick={() =>
              gaEvent("call_click", { placement: "header", site: "conectahomes" })
            }
            className="
              inline-flex items-center gap-2
              rounded-xl
              bg-ckOrange
              px-3 py-2
              text-sm font-extrabold
              text-ckNavy
              shadow-sm
            "
          >
            <span className="text-lg">📞</span>
            <span className="hidden sm:inline">Atención en español</span>
            <span className="hidden md:inline font-semibold">
              {SUPPORT_PHONE_DISPLAY}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
