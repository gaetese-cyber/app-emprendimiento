"use client";

import { useState } from "react";
import { marked } from "marked";

marked.setOptions({ breaks: true });

interface Props {
  zona: string;
  ideaElegida: string;
  capital: string;
  localPropio: string;
}

export default function PlanAccion({ zona, ideaElegida, capital, localPropio }: Props) {
  const [contenido, setContenido] = useState("");
  const [cargando, setCargando] = useState(false);
  const [generado, setGenerado] = useState(false);

  async function generar() {
    setCargando(true);
    setContenido("");
    try {
      const res = await fetch("/api/plan-accion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zona, ideaElegida, capital, localPropio }),
      });

      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setContenido((prev) => prev + decoder.decode(value, { stream: true }));
      }

      setGenerado(true);
    } catch {
      setContenido("No se pudo generar el plan. Intentá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="bg-bone rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-earth/10 rounded-lg grid place-items-center">
          <svg className="w-4 h-4 text-earth" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Plan de acción semana a semana</h2>
          <p className="text-xs text-slate-400">Tareas concretas para cada semana — desde cero hasta el local abierto</p>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-4">
        {!generado && (
          <button
            onClick={generar}
            disabled={cargando}
            className="bg-earth hover:bg-earth text-cream text-sm font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Armando tu plan…
              </>
            ) : (
              <>
                Ver mi plan de acción
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        )}

        {(contenido || cargando) && (
          <div>
            {generado && (
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-bottle" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Plan generado</span>
              </div>
            )}
            <div className="markdown" dangerouslySetInnerHTML={{ __html: marked(contenido) as string }} />
            {cargando && contenido && (
              <span className="inline-block w-0.5 h-4 bg-earth animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
