"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gaEvent } from "@/lib/ga";

export default function HomePage() {
  const router = useRouter();
  const [zip, setZip] = useState("");
  const zipOk = /^\d{5}$/.test(zip);
  const [locLoading, setLocLoading] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ===== Hero Section ===== */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-10">
        <div className="rounded-[32px] bg-white p-8 shadow-sm md:p-12">
          <h1 className="text-3xl font-extrabold leading-tight text-ckNavy md:text-4xl">
            Internet y móvil en Estados Unidos,
            <br />
            <span className="text-ckOrange">
              fácil y en español
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
            Ingresa tu código postal y compara los mejores planes de
            internet y móvil disponibles en tu área.
            Atención 100% en español.
          </p>

          {/* ZIP Input Card */}
          <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value.trim())}
                inputMode="numeric"
                maxLength={5}
                placeholder="Código postal (5 dígitos)"
                className="
                  flex-1
                  rounded-2xl
                  border
                  border-slate-300
                  bg-white
                  px-5
                  py-4
                  text-base
                  text-slate-900
                  placeholder:text-slate-400
                  outline-none
                  focus:border-slate-900
                  focus:ring-1
                  focus:ring-slate-900
                "
              />

              <button
                disabled={!zipOk || locLoading}
                onClick={async () => {
                  try {
                    setLocLoading(true);
                    localStorage.setItem("ck_zip", zip);
                    window.dispatchEvent(new Event("ck_zip_updated"));
                    gaEvent("zip_submit", { zip, site: "conectahomes" });
                    router.push(`/compare?zip=${zip}`);
                  } finally {
                    setLocLoading(false);
                  }
                }}
                className="
                  shrink-0
                  min-w-[160px]
                  rounded-2xl
                  bg-slate-900
                  px-6
                  py-4
                  text-base
                  font-extrabold
                  text-white
                  shadow-md
                  transition
                  hover:bg-slate-800
                  disabled:opacity-40
                "
              >
                {locLoading ? "Buscando..." : "Ver TOP 3 planes"}
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              ✔ Incluye costos ocultos · ✔ Atención en español
            </p>
          </div>
        </div>
      </section>

      {/* ===== Value Proposition ===== */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Costos reales",
              desc: "Consideramos promociones, cargos por equipo e instalación.",
            },
            {
              title: "Planes según tu necesidad",
              desc: "Estudiantes, familias y gamers reciben la mejor opción.",
            },
            {
              title: "Asesoría en español",
              desc: "Te explicamos todo y contratamos contigo en una llamada.",
            },
          ].map((v, i) => (
            <div
              key={i}
              className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-extrabold text-ckNavy">
                {v.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
