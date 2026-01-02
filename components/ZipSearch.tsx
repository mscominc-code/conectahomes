"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { carriers, plans } from "@/lib/plans";
import { pickTop3, calc12moTotal } from "@/lib/recommend";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/utils";
import { gaEvent } from "@/lib/ga";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-extrabold text-orange-700">
      {children}
    </span>
  );
}

type ZipLookup = { zip: string; city: string | null; state: string | null };

export default function ZipSearch() {
  const router = useRouter();
  const [zip, setZip] = useState("");
  const [submittedZip, setSubmittedZip] = useState<string | null>(null);

  const [loc, setLoc] = useState<ZipLookup | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const zipOk = /^\d{5}$/.test(zip);
  const top3 = useMemo(() => pickTop3(plans), [submittedZip]);

  async function lookupZip(z: string) {
    setLoc(null);
    setLocError(null);
    setLocLoading(true);
    try {
      const res = await fetch(`/api/zip/${z}`);
      if (!res.ok) {
        setLocError(
          "No pudimos encontrar la ciudad o el estado. Llámanos y lo confirmamos en 1 minuto."
        );
        return;
      }
      const data = (await res.json()) as ZipLookup;
      setLoc(data);
    } catch {
      setLocError("Ocurrió un error al buscar el ZIP. Inténtalo de nuevo.");
    } finally {
      setLocLoading(false);
    }
  }

  return (
    <section
      className="
        relative overflow-hidden
        rounded-[28px]
        bg-gradient-to-br from-slate-50 via-white to-slate-100
        p-7
        shadow-[0_20px_60px_-20px_rgba(15,23,42,0.25)]
      "
    >
      {/* ===== HERO ===== */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold leading-tight text-slate-900 md:text-4xl">
          Internet y móvil en EE.UU.,
          <br />
          <span className="text-ckOrange">
            compara fácilmente en español
          </span>
        </h1>

        <p className="text-base text-slate-500 md:text-lg">
          Ingresa tu código postal y te mostramos los mejores planes disponibles
          en tu área.
        </p>
      </div>

      {/* ===== ZIP INPUT ===== */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value.trim())}
          inputMode="numeric"
          maxLength={5}
          placeholder="Ingresa tu ZIP Code (5 dígitos)"
          className="
            w-full rounded-2xl
            border border-slate-300
            bg-white/80
            px-5 py-4 text-base
            backdrop-blur
            outline-none
            transition
            focus:border-ckOrange
            focus:ring-4 focus:ring-ckOrange/20
          "
        />

        <button
          disabled={!zipOk || locLoading}
          onClick={async () => {
            setSubmittedZip(zip);
            gaEvent("zip_submit", { zip });
            try {
              localStorage.setItem("ck_zip", zip);
              window.dispatchEvent(new Event("ck_zip_updated"));
            } catch {}
            await lookupZip(zip);
          }}
          className="
            rounded-2xl
            bg-gradient-to-r from-ckNavy to-slate-900
            px-7 py-4
            text-base font-extrabold text-white
            shadow-lg shadow-ckNavy/30
            transition
            hover:-translate-y-0.5 hover:shadow-xl
            disabled:opacity-40 disabled:hover:translate-y-0
          "
        >
          {locLoading ? "Buscando..." : "Ver TOP 3"}
        </button>
      </div>

      {!submittedZip && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          ⏱️ La disponibilidad puede variar por zona. Ingresa tu ZIP y revisa
          nuestras <b>3 mejores recomendaciones</b>.
        </div>
      )}

      {/* ===== RESULT ===== */}
      {submittedZip && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-sm text-slate-600">📍 Ubicación</div>

            {loc && (loc.city || loc.state) ? (
              <div className="text-lg font-extrabold text-ckNavy">
                {loc.city ?? "—"}, {loc.state ?? "—"} ({submittedZip})
              </div>
            ) : (
              <div className="text-lg font-extrabold text-ckNavy">
                ({submittedZip})
              </div>
            )}

            <p className="mt-1 text-sm text-slate-600">
              La disponibilidad exacta se confirma con una{" "}
              <b>llamada de 1 minuto</b>.
            </p>

            <a
              href={`tel:${SUPPORT_PHONE_TEL}`}
              className="
                mt-4
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-ckOrange
                px-4
                py-4
                text-base
                font-extrabold
                text-white
                shadow-lg
                ring-1 ring-black/5
                hover:brightness-95
              "
            >
              📞 Llamar ahora ({SUPPORT_PHONE_DISPLAY})
            </a>
          </div>

          {/* ===== TOP 3 ===== */}
          <div className="grid gap-3 md:grid-cols-3">
            {top3.map(({ role, plan }) => {
              const carrier = carriers.find(
                (c) => c.id === plan.carrierId
              );
              const total12 = calc12moTotal(plan);

              return (
                <div
                  key={plan.id}
                  className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge>{role}</Badge>
                    <div className="text-xs text-slate-500">
                      {carrier?.name}
                    </div>
                  </div>

                  <div className="mt-3 text-lg font-extrabold text-ckNavy">
                    {plan.name}
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-slate-600">Velocidad</div>
                      <div className="font-extrabold">
                        {plan.downloadMbps}M
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-slate-600">Mensual</div>
                      <div className="font-extrabold">
                        ${plan.promoPrice.toFixed(0)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-slate-600">12 meses</div>
                      <div className="font-extrabold">
                        ${total12.toFixed(0)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <a
                      href={`tel:${SUPPORT_PHONE_TEL}`}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-ckOrange px-4 py-3 text-sm font-extrabold text-white"
                    >
                      📞 Consultar este plan
                    </a>

                    <button
                      onClick={() =>
                        router.push(
                          `/compare?zip=${submittedZip}`
                        )
                      }
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-extrabold text-ckNavy"
                    >
                      Ver todos los planes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
