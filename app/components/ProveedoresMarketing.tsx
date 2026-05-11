"use client";

import { useState } from "react";
import { marked } from "marked";

marked.setOptions({ breaks: true });

interface Props {
  zona: string;
  intereses: string;
}

export default function ProveedoresMarketing({ zona, intereses }: Props) {
  const [contenido, setContenido] = useState("");
  const [cargando, setCargando] = useState(false);
  const [generado, setGenerado] = useState(false);

  async function generar() {
    setCargando(true);
    setContenido("");
    try {
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zona, intereses }),
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
      setContenido("No se pudo generar la información. Intentá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-violet-100 rounded-lg grid place-items-center">
          <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Proveedores y cómo conseguir clientes</h2>
          <p className="text-xs text-slate-400">De dónde comprar el stock + estrategia de ventas para los primeros meses</p>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-4">
        {!generado && (
          <button
            onClick={generar}
            disabled={cargando}
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Buscando proveedores y armando estrategia…
              </>
            ) : (
              <>
                Ver proveedores y cómo conseguir clientes
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
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Información generada</span>
              </div>
            )}
            <div
              className="markdown"
              dangerouslySetInnerHTML={{ __html: marked(contenido) as string }}
            />
            {cargando && contenido && (
              <span className="inline-block w-0.5 h-4 bg-violet-500 animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
