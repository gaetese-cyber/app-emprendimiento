"use client";

import { useState } from "react";

function formatPesos(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default function CalculadoraPrecio() {
  const [costo, setCosto] = useState("");
  const [margen, setMargen] = useState("");
  const [facturacion, setFacturacion] = useState<"no" | "mono" | "ri">("no");
  const [resultado, setResultado] = useState<null | {
    precioSinIva: number;
    precioConIva: number;
    ganancia: number;
    margenReal: number;
  }>(null);
  const [error, setError] = useState("");

  function calcular() {
    setError("");
    setResultado(null);

    const c = parseFloat(costo.replace(/\./g, "").replace(",", "."));
    const m = parseFloat(margen.replace(",", "."));

    if (isNaN(c) || c <= 0) { setError("Ingresá el costo del producto."); return; }
    if (isNaN(m) || m <= 0) { setError("Ingresá el margen de ganancia."); return; }

    const precioSinIva = c * (1 + m / 100);
    const iva = facturacion === "ri" ? precioSinIva * 0.21 : 0;
    const precioConIva = precioSinIva + iva;
    const ganancia = precioSinIva - c;

    setResultado({ precioSinIva, precioConIva, ganancia, margenReal: m });
  }

  const inputClass = "w-full bg-cream/40 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bottle/30 focus:border-navy/30 transition";

  return (
    <div className="bg-bone rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-teal-100 rounded-lg grid place-items-center">
          <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Calculadora de precio de venta</h2>
          <p className="text-xs text-slate-400">Ingresá lo que te costó algo y te decimos a cuánto venderlo para ganar bien</p>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">¿Cuánto te costó el producto?</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input type="text" placeholder="Lo que te costó" value={costo} onChange={(e) => setCosto(e.target.value)} className={inputClass + " pl-6"} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">¿Cuánto querés ganar encima?</label>
            <div className="relative">
              <input type="text" placeholder="Ej: 40" value={margen} onChange={(e) => setMargen(e.target.value)} className={inputClass + " pr-8"} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">40% es un buen punto de partida</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">¿Cómo facturás?</label>
          <div className="flex gap-2">
            {[
              { val: "no", label: "No facturo" },
              { val: "mono", label: "Monotributo" },
              { val: "ri", label: "Resp. Inscripto" },
            ].map((op) => (
              <button
                key={op.val}
                onClick={() => setFacturacion(op.val as typeof facturacion)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  facturacion === op.val
                    ? "bg-navy text-cream border-navy/30"
                    : "bg-cream/40 text-slate-600 border-slate-200 hover:border-navy/30"
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {facturacion === "no" && "No emitís facturas. Ideal para empezar muy chico."}
            {facturacion === "mono" && "Monotributo: pagás una cuota fija mensual. No cobrás IVA extra a tus clientes."}
            {facturacion === "ri" && "Responsable Inscripto: le sumás 21% de IVA al precio. Tenés que declararlo a AFIP."}
          </p>
          <p className="text-xs text-navy mt-1">¿No sabés cuál sos? Si estás empezando, probablemente Monotributo. Consultá con un contador.</p>
        </div>

        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <button
          onClick={calcular}
          className="bg-teal-600 hover:bg-teal-700 text-cream text-sm font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          Calcular precio de venta
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {resultado && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 flex flex-col gap-4">
            <div className="text-center">
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">Precio de venta sugerido</p>
              <p className="text-4xl font-bold text-teal-700">{formatPesos(resultado.precioConIva)}</p>
              {facturacion === "ri" && (
                <p className="text-xs text-teal-500 mt-1">Incluye IVA 21% — sin IVA: {formatPesos(resultado.precioSinIva)}</p>
              )}
            </div>

            <div className="border-t border-teal-200" />

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-bone rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Tu ganancia por unidad</p>
                <p className="text-sm font-bold text-bottle">{formatPesos(resultado.ganancia)}</p>
              </div>
              <div className="bg-bone rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Margen aplicado</p>
                <p className="text-sm font-bold text-slate-800">{resultado.margenReal}%</p>
              </div>
            </div>

            <p className="text-xs text-teal-700 bg-teal-100 rounded-lg px-3 py-2 text-center">
              Por cada {formatPesos(parseFloat(costo.replace(/\./g, "").replace(",", ".")) || 0)} que invertís, ganás {formatPesos(resultado.ganancia)} 💰
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
