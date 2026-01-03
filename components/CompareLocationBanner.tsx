"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/utils";
import { gaEvent } from "@/lib/ga";

type ZipLookup = {
  zip: string;
  city: string | null;
  state: string | null;
  error?: string;
};

export default function CompareLocationBanner() {
  const sp = useSearchParams();
  const router = useRouter();

  const zip = (sp.get("zip") ?? "").trim();
  const [zipInput, setZipInput] = useState(zip);

  const [loc, setLoc] = useState<ZipLookup | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const zipOk = useMemo(() => /^\d{5}$/.test(zipInput), [zipInput]);

  useEffect(() => {
    setZipInput(zip);
  }, [zip]);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!/^\d{5}$/.test(zip)) {
        setLoc(null);
        setMsg(
          "Ingresa tu Zip Code para ver los planes disponibles en tu área."
        );
        return;
      }

      setLoading(true);
      setMsg(null);
      try {
        const res = await fetch(`/api/zip/${zip}`);
        const data = (await res.json()) as ZipLookup;

        if (!alive) return;

        if (!res.ok || data.error) {
          setLoc({ zip, city: null, state: null });
          setMsg(
            "No pudimos encontrar la ciudad o el estado para este Zip. (Podemos confirmarlo por teléfono en 1 minuto)"
          );
          return;
        }

        setLoc({
          zip,
          city: data.city ?? null,
          state: data.state ?? null,
        });
      } catch {
        if (!alive) return;
        setLoc({ zip, city: null, state: null });
        setMsg(
          "Ocurrió un error al consultar el Zip. (Podemos confirmarlo por teléfono en 1 minuto)"
        );
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [zip]);

  const applyZip = () => {
    const z = zipInput.trim();
    if (!/^\d{5}$/.test(z)) return;

    try {
      localStorage.setItem("ck_zip", z);
      window.dispatchEvent(new Event("ck_zip_updated"));
    } catch {}

    gaEvent("zip_submit", { zip: z, from: "compare_banner" });
    router.push(`/compare?zip=${z}`);
  };

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="text-sm text-slate-600">📍 Ubicación</div>

          {loading ? (
            <div className="text-lg font-extrabold text-ckNavy">
              Buscando…
            </div>
          ) : loc?.zip ? (
            <div className="text-lg font-extrabold text-ckNavy">
              {loc.city ? loc.city : "—"},{" "}
              {loc.state ? loc.state : "—"} ({loc.zip})
            </div>
          ) : (
            <div className="text-lg font-extrabold text-ckNavy">
              (Zip no ingresado)
            </div>
          )}

          {msg ? (
            <p className="mt-1 text-sm text-slate-600">{msg}</p>
          ) : (
            <p className="mt-1 text-sm text-slate-600">
              La disponibilidad exacta se confirma en{" "}
              <b>1 minuto por teléfono</b>.
            </p>
          )}

          {/* Zip edit */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value.trim())}
              inputMode="numeric"
              maxLength={5}
              placeholder="Zip Code (5 dígitos)"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-ckOrange sm:w-56"
            />
            <button
              onClick={applyZip}
              disabled={!zipOk}
              className="rounded-2xl bg-ckNavy px-5 py-3 text-sm font-extrabold text-white disabled:opacity-40"
            >
              Aplicar
            </button>
          </div>
        </div>

        {/* Call CTA */}
        <a
          href={`tel:${SUPPORT_PHONE_TEL}`}
          onClick={() =>
            gaEvent("call_click", {
              placement: "compare_banner",
              zip,
            })
          }
          className="
            relative
            inline-flex
            w-full
            items-center
            justify-center
            rounded-2xl
            bg-ckOrange
            px-4
            py-4
            shadow-lg
            md:w-auto
          "
        >
          <span className="font-extrabold text-white">
            📞 Llama ahora ({SUPPORT_PHONE_DISPLAY})
          </span>
        </a>
      </div>
    </section>
  );
}
