"use client";

import { useState } from "react";

interface CostoFijo {
  id: number;
  nombre: string;
  monto: string;
}

const inputClass =
  "bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition w-full";

function formatPesos(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default function PuntoEquilibrio() {
  const [costosFijos, setCostosFijos] = useState<CostoFijo[]>([
    { id: 1, nombre: "Alquiler del local", monto: "" },
    { id: 2, nombre: "Sueldo deseado", monto: "" },
    { id: 3, nombre: "Servicios (luz, agua, internet)", monto: "" },
  ]);
  const [costoVariable, setCostoVariable] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [resultado, setResultado] = useState<null | { unidades: number; facturacion: number; totalFijos: number; margen: number }>(null);
  const [error, setError] = useState("");

  function agregarCosto() {
    setCostosFijos((prev) => [
      ...prev,
      { id: Date.now(), nombre: "", monto: "" },
    ]);
  }

  function eliminarCosto(id: number) {
    setCostosFijos((prev) => prev.filter((c) => c.id !== id));
  }

  function actualizarCosto(id: number, campo: "nombre" | "monto", valor: string) {
    setCostosFijos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [campo]: valor } : c))
    );
  }

  function calcular() {
    setError("");
    setResultado(null);

    const totalFijos = costosFijos.reduce((sum, c) => {
      const n = parseFloat(c.monto.replace(/\./g, "").replace(",", "."));
      return sum + (isNaN(n) ? 0 : n);
    }, 0);

    const cv = parseFloat(costoVariable.replace(/\./g, "").replace(",", "."));
    const pv = parseFloat(precioVenta.replace(/\./g, "").replace(",", "."));

    if (totalFijos <= 0) { setError("Ingresá al menos un costo fijo."); return; }
    if (isNaN(cv) || cv <= 0) { setError("Ingresá el costo por unidad vendida."); return; }
    if (isNaN(pv) || pv <= 0) { setError("Ingresá el precio de venta."); return; }
    if (pv <= cv) { setError("El precio de venta debe ser mayor al costo por unidad."); return; }

    const margen = pv - cv;
    const unidades = Math.ceil(totalFijos / margen);
    const facturacion = unidades * pv;

    setResultado({ unidades, facturacion, totalFijos, margen });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-emerald-100 rounded-lg grid place-items-center">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">¿Cuánto necesitás vender para no perder plata?</h2>
          <p className="text-xs text-slate-400">Calculá el mínimo de ventas para cubrir todos tus gastos</p>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-5">
        {/* Explicación del concepto */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-600">¿Qué es esto?</span> Es el número mínimo de productos o servicios que necesitás vender cada mes para cubrir todos tus gastos y no perder plata. A partir de ese número, cada venta es ganancia.
        </div>

        {/* Costos fijos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Gastos fijos por mes</label>
              <p className="text-xs text-slate-400 mt-0.5">Lo que pagás sí o sí, aunque no vendas nada</p>
            </div>
            <button
              onClick={agregarCosto}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Agregar
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {costosFijos.map((costo) => (
              <div key={costo.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Descripción (ej: Alquiler)"
                  value={costo.nombre}
                  onChange={(e) => actualizarCosto(costo.id, "nombre", e.target.value)}
                  className={inputClass + " flex-1"}
                />
                <div className="relative w-36 flex-shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="text"
                    placeholder="0"
                    value={costo.monto}
                    onChange={(e) => actualizarCosto(costo.id, "monto", e.target.value)}
                    className={inputClass + " pl-6"}
                  />
                </div>
                {costosFijos.length > 1 && (
                  <button
                    onClick={() => eliminarCosto(costo.id)}
                    className="text-slate-300 hover:text-red-400 transition flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Costo variable y precio */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              ¿Cuánto te cuesta cada producto?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="text"
                placeholder="El costo de lo que vendés"
                value={costoVariable}
                onChange={(e) => setCostoVariable(e.target.value)}
                className={inputClass + " pl-6"}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              ¿A cuánto lo vendés?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="text"
                placeholder="Tu precio de venta"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(e.target.value)}
                className={inputClass + " pl-6"}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          onClick={calcular}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          Calcular cuánto necesito vender
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Resultado */}
        {resultado && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex flex-col gap-4">
            <div className="text-center">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Para cubrir todos tus costos necesitás vender</p>
              <p className="text-4xl font-bold text-emerald-700">{resultado.unidades.toLocaleString("es-AR")}</p>
              <p className="text-sm text-emerald-600 mt-1">unidades por mes</p>
            </div>

            <div className="border-t border-emerald-200" />

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Facturación mínima</p>
                <p className="text-sm font-bold text-slate-800">{formatPesos(resultado.facturacion)}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Total costos fijos</p>
                <p className="text-sm font-bold text-slate-800">{formatPesos(resultado.totalFijos)}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Margen por unidad</p>
                <p className="text-sm font-bold text-emerald-600">{formatPesos(resultado.margen)}</p>
              </div>
            </div>

            <p className="text-xs text-emerald-700 text-center bg-emerald-100 rounded-lg px-3 py-2">
              A partir de la unidad {(resultado.unidades + 1).toLocaleString("es-AR")} cada venta es ganancia pura 🎯
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
