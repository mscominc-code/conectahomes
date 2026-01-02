"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CompareLocationBanner from "@/components/CompareLocationBanner";
import { carriers, plans, type Plan } from "@/lib/plans";
import { calc12moTotal } from "@/lib/recommend";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/utils";
import { gaEvent } from "@/lib/ga";

/* =========================
   Utilidades
========================= */

function money12(plan: Plan, includeHidden: boolean) {
  return includeHidden ? calc12moTotal(plan) : plan.promoPrice * 12;
}

function fmtPrice(n: number) {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
}

function getPlanRoles(list: Plan[], includeHidden: boolean) {
  if (!list.length) return {};

  const bySpeed = [...list].sort((a, b) => a.downloadMbps - b.downloadMbps);
  const byCost = [...list].sort(
    (a, b) => money12(a, includeHidden) - money12(b, includeHidden)
  );

  return {
    cheapId: byCost[0].id,                          // Mejor precio
    fastId: bySpeed[bySpeed.length - 1].id,         // Más rápido
    recommendId: bySpeed[Math.floor(bySpeed.length / 2)].id, // Recomendado
  };
}

function PlanBadge({ label }: { label: "Mejor precio" | "Más rápido" | "Recomendado" }) {
  const style =
    label === "Mejor precio"
      ? "bg-emerald-50 text-emerald-700"
      : label === "Más rápido"
      ? "bg-blue-50 text-blue-700"
      : "bg-purple-50 text-purple-700";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${style}`}>
      {label}
    </span>
  );
}

/* =========================
   Componente principal
========================= */

export default function CompareClient() {
  const sp = useSearchParams();
  const zip = (sp.get("zip") ?? "").trim();

  const [includeHidden, setIncludeHidden] = useState(false);

  const grouped = useMemo(() => {
    return carriers.map((carrier) => {
      const list = plans
        .filter((p) => p.carrierId === carrier.id)
        .sort((a, b) => a.downloadMbps - b.downloadMbps);

      return {
        carrier,
        list,
        roles: getPlanRoles(list, includeHidden),
      };
    });
  }, [includeHidden]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Banner ZIP */}
      <CompareLocationBanner />

      {/* Opciones */}
      <section className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-ckNavy">
              Comparar planes
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {zip
                ? `Planes disponibles según el código postal ${zip}`
                : "Ingresa tu código postal para resultados más precisos"}
            </p>
          </div>

          <button
            onClick={() => setIncludeHidden((v) => !v)}
            className={
              "rounded-2xl px-4 py-2 text-sm font-extrabold transition " +
              (includeHidden
                ? "bg-ckNavy text-slate-500"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200")
            }
          >
            {includeHidden ? "✅ Costos reales incluidos" : "Incluir costos reales"}
          </button>
        </div>
      </section>

      {/* ===== Planes por proveedor ===== */}
      <section className="mt-6 space-y-6">
        {grouped.map(({ carrier, list, roles }) => (
          <div
            key={carrier.id}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            {/* Encabezado proveedor */}
            <div className="flex items-center gap-3">
              <img
                src={`/logos/${carrier.id}.png`}
                alt={carrier.name}
                className="h-10 w-auto object-contain"
              />
              <span className="text-lg font-extrabold text-ckNavy">
                {carrier.name}
              </span>
            </div>

            {/* Mensaje de venta */}
            <p className="mt-1 text-sm text-slate-600">
              {carrier.id === "att" && "Internet de fibra con velocidades simétricas"}
              {carrier.id === "spectrum" && "Cobertura amplia en todo Estados Unidos"}
              {carrier.id === "frontier" && "Planes de fibra con excelente precio"}
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {list.map((p) => {
                const total12 = money12(p, includeHidden);

                return (
                  <div
                    key={p.id}
                    className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    {/* Título + badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-lg font-extrabold text-ckNavy">
                        {p.name}
                      </div>

                      {p.id === roles.cheapId && <PlanBadge label="Mejor precio" />}
                      {p.id === roles.fastId && <PlanBadge label="Más rápido" />}
                      {p.id === roles.recommendId && <PlanBadge label="Recomendado" />}
                    </div>

                    <p className="mt-1 text-sm text-slate-600">
                      Velocidad: {p.downloadMbps} Mbps
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-slate-500">Mensual</div>
                        <div className="font-extrabold">
                          ${fmtPrice(p.promoPrice)}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-slate-500">12 meses</div>
                        <div className="font-extrabold">
                          ${total12.toFixed(0)}
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-slate-500">Contrato</div>
                        <div className="font-extrabold">
                          {p.contractMonths === 0
                            ? "Sin contrato"
                            : `${p.contractMonths} meses`}
                        </div>
                      </div>
                    </div>

                    <a
                      href={`tel:${SUPPORT_PHONE_TEL}`}
                      onClick={() =>
                        gaEvent("call_click", {
                          placement: "compare_card",
                          carrier: carrier.name,
                          plan_id: p.id,
                          zip,
                          site: "conectahomes",
                        })
                      }
                      className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-ckOrange px-4 py-3 text-sm font-extrabold text-ckNavy"
                    >
                      📞 Llamar para contratar ({SUPPORT_PHONE_DISPLAY})
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
