"use client";

import { useState } from "react";

function formatPesos(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

function parseMonto(s: string): number {
  const n = parseFloat(s.replace(/[^\d,]/g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

interface Item {
  id: number;
  categoria: string;
  descripcion: string;
  monto: string;
  obligatorio: boolean;
}

interface Props {
  ideaElegida: string;
  capital: string;
  zona: string;
  localPropio: string;
}

const COLORES: Record<string, string> = {
  local:        "bg-earth/10 text-earth",
  stock:        "bg-navy/10 text-navy",
  inventario:   "bg-navy/10 text-navy",
  trámites:     "bg-red-100 text-red-700",
  habilitaciones:"bg-red-100 text-red-700",
  equipamiento: "bg-navy/10 text-navy",
  marketing:    "bg-navy/10 text-navy",
  capital:      "bg-bottle/10 text-bottle",
  acondicionamiento: "bg-earth/10 text-earth",
};

function colorCategoria(cat: string): string {
  const k = cat.toLowerCase();
  for (const [key, val] of Object.entries(COLORES)) {
    if (k.includes(key)) return val;
  }
  return "bg-cream text-slate-600";
}

let nextId = 100;

export default function PresupuestoInicial({ ideaElegida, capital, zona, localPropio }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [consejo, setConsejo] = useState("");
  const [generado, setGenerado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function generar() {
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/presupuesto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaElegida, capital, zona, localPropio }),
      });
      if (!res.ok) { setError("No se pudo generar. Intentá de nuevo."); return; }
      const data = await res.json();
      if (data.error) { setError(data.error); return; }

      setItems(
        (data.items || []).map((item: { categoria: string; descripcion: string; montoMin: number; obligatorio: boolean }, i: number) => ({
          id: i,
          categoria: item.categoria,
          descripcion: item.descripcion,
          monto: String(item.montoMin || 0),
          obligatorio: item.obligatorio,
        }))
      );
      setConsejo(data.consejo || "");
      setGenerado(true);
    } catch {
      setError("Error al generar el presupuesto.");
    } finally {
      setCargando(false);
    }
  }

  function actualizarMonto(id: number, valor: string) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, monto: valor } : it));
  }

  function actualizarDescripcion(id: number, valor: string) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, descripcion: valor } : it));
  }

  function eliminar(id: number) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function agregar() {
    setItems((prev) => [...prev, { id: nextId++, categoria: "Otro", descripcion: "", monto: "0", obligatorio: true }]);
  }

  const total = items.reduce((s, it) => s + parseMonto(it.monto), 0);
  const capitalNum = parseFloat(capital.replace(/[^\d]/g, ""));
  const capitalValido = !isNaN(capitalNum) && capitalNum > 0;

  const inputClass = "bg-cream/40 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-bottle/30 focus:border-navy/30 transition";

  return (
    <div className="bg-bone rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-indigo-100 rounded-lg grid place-items-center">
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Presupuesto de arranque</h2>
          <p className="text-xs text-slate-400">La IA sugiere los costos — vos los ajustás a tu realidad</p>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-4">
        {!generado && (
          <button onClick={generar} disabled={cargando}
            className="bg-indigo-600 hover:bg-indigo-700 text-cream text-sm font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
            {cargando ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Estimando costos…</>
            ) : (
              <>Ver estimado de costos de arranque
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        )}

        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        {generado && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bottle" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Presupuesto — editá los montos a tu medida</span>
              </div>
              <button onClick={agregar}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Agregar fila
              </button>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream/40 border-b border-slate-100">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Rubro</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Detalle</th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-40">Tu estimado ($)</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-3 py-3 align-middle">
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${colorCategoria(item.categoria)}`}>
                          {item.categoria}
                        </span>
                        {!item.obligatorio && <span className="block text-xs text-slate-400 mt-0.5">Opcional</span>}
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <input
                          type="text"
                          value={item.descripcion}
                          onChange={(e) => actualizarDescripcion(item.id, e.target.value)}
                          className={inputClass + " w-full"}
                        />
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                          <input
                            type="text"
                            value={item.monto}
                            onChange={(e) => actualizarMonto(item.id, e.target.value)}
                            className={inputClass + " pl-5 text-right w-full"}
                          />
                        </div>
                      </td>
                      <td className="px-2 py-3 align-middle">
                        <button onClick={() => eliminar(item.id)}
                          className="text-slate-300 hover:text-red-400 transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-indigo-50 border-t-2 border-indigo-100">
                    <td colSpan={2} className="px-3 py-3 text-sm font-bold text-indigo-800">Total</td>
                    <td className="px-3 py-3 text-sm font-bold text-right text-indigo-800">{formatPesos(total)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {capitalValido && (
              <div className={`rounded-xl px-4 py-3 text-xs font-medium flex items-start gap-2 ${
                capitalNum >= total
                  ? "bg-bottle/10 border border-bottle/30 text-bottle"
                  : "bg-earth/10 border border-earth/30 text-earth"
              }`}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {capitalNum >= total
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
                </svg>
                {capitalNum >= total
                  ? `Tu capital de ${formatPesos(capitalNum)} cubre el total estimado. Podés empezar.`
                  : `Tu capital de ${formatPesos(capitalNum)} es menor al total (${formatPesos(total)}). Ajustá los valores o buscá financiamiento.`}
              </div>
            )}

            {consejo && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700 leading-relaxed">
                <span className="font-semibold">Consejo:</span> {consejo}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
