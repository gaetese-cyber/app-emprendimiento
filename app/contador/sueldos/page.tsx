"use client";

import { useState } from "react";
import { Calculator, Info } from "lucide-react";

interface Inputs {
  bruto: string;
  obraSocial: string; // porcentaje adicional sobre el básico, si tiene prepaga
  sindicato: string;
  extras: string; // horas extra
  valorHora: string;
  cantExtras: string;
  noRemunerativo: string;
}

const EMPTY: Inputs = {
  bruto: "",
  obraSocial: "3",
  sindicato: "2",
  extras: "0",
  valorHora: "",
  cantExtras: "0",
  noRemunerativo: "0",
};

// Aportes del trabajador vigentes (porcentajes fijos por ley)
const SIPA = 0.11;         // jubilación
const INSSJP = 0.03;       // PAMI
const OBRA_SOCIAL = 0.03;  // obra social básica

export default function SueldosPage() {
  const [inputs, setInputs] = useState<Inputs>(EMPTY);
  const [result, setResult] = useState<ReturnType<typeof calcular> | null>(null);

  function set(field: keyof Inputs, value: string) {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }

  function calcular(i: Inputs) {
    const bruto = parseFloat(i.bruto) || 0;
    const horasExtra = (parseFloat(i.valorHora) || 0) * (parseFloat(i.cantExtras) || 0);
    const noRem = parseFloat(i.noRemunerativo) || 0;
    const remunerativo = bruto + horasExtra;
    const totalBruto = remunerativo + noRem;

    const aporteSIPA = remunerativo * SIPA;
    const aporteINSSJP = remunerativo * INSSJP;
    const aporteObraSocial = remunerativo * OBRA_SOCIAL;
    const aporteSindicato = remunerativo * ((parseFloat(i.sindicato) || 0) / 100);
    const totalAportes = aporteSIPA + aporteINSSJP + aporteObraSocial + aporteSindicato;

    const neto = totalBruto - totalAportes;

    // Contribuciones patronales (orientativas, dependen del convenio)
    const patronalJubilacion = remunerativo * 0.1017;
    const patronalIAJO = remunerativo * 0.009;     // asignaciones familiares
    const patronalFNES = remunerativo * 0.005;     // desempleo
    const patronalINSSJP = remunerativo * 0.0170;  // PAMI patronal
    const patronalObraSocial = remunerativo * 0.06;
    const totalPatronal = patronalJubilacion + patronalIAJO + patronalFNES + patronalINSSJP + patronalObraSocial;

    const costoEmpleador = totalBruto + totalPatronal;

    return {
      bruto,
      horasExtra,
      noRem,
      remunerativo,
      totalBruto,
      aporteSIPA,
      aporteINSSJP,
      aporteObraSocial,
      aporteSindicato,
      totalAportes,
      neto,
      patronalJubilacion,
      patronalIAJO,
      patronalFNES,
      patronalINSSJP,
      patronalObraSocial,
      totalPatronal,
      costoEmpleador,
    };
  }

  function handleCalc() {
    setResult(calcular(inputs));
  }

  const fmt = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--color-earth)" }}>
          Módulo
        </p>
        <h1 className="text-3xl font-bold" style={{ color: "var(--color-ink)", fontFamily: "var(--font-serif)" }}>
          Liquidación de Sueldos
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Calculadora de haberes netos y costo empleador — porcentajes vigentes LCT / RG AFIP.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div
          className="rounded-2xl border p-6"
          style={{ background: "white", borderColor: "var(--color-border-soft)" }}
        >
          <h2 className="font-bold mb-5" style={{ color: "var(--color-ink)" }}>Datos del empleado</h2>

          <div className="space-y-4">
            <FormRow label="Sueldo bruto básico" hint="Según recibo o escala">
              <MoneyInput value={inputs.bruto} onChange={(v) => set("bruto", v)} placeholder="0,00" />
            </FormRow>

            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Horas extra (cantidad)">
                <input
                  type="number"
                  min="0"
                  value={inputs.cantExtras}
                  onChange={(e) => set("cantExtras", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                />
              </FormRow>
              <FormRow label="Valor hora extra">
                <MoneyInput value={inputs.valorHora} onChange={(v) => set("valorHora", v)} placeholder="0,00" />
              </FormRow>
            </div>

            <FormRow label="No remunerativo" hint="Tickets, vales, etc.">
              <MoneyInput value={inputs.noRemunerativo} onChange={(v) => set("noRemunerativo", v)} placeholder="0,00" />
            </FormRow>

            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Obra social trabajador %" hint="Base 3%">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={inputs.obraSocial}
                  onChange={(e) => set("obraSocial", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                />
              </FormRow>
              <FormRow label="Cuota sindical %">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={inputs.sindicato}
                  onChange={(e) => set("sindicato", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                />
              </FormRow>
            </div>

            <button
              onClick={handleCalc}
              disabled={!inputs.bruto}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white mt-2 transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-earth)" }}
            >
              <Calculator size={18} /> Calcular liquidación
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result ? (
            <div
              className="rounded-2xl border flex items-center justify-center p-16"
              style={{ background: "white", borderColor: "var(--color-border-soft)" }}
            >
              <div className="text-center">
                <Calculator size={40} className="mx-auto mb-3 opacity-20" style={{ color: "var(--color-earth)" }} />
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Completá los datos y calculá.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Net salary highlight */}
              <div
                className="rounded-2xl p-6 text-white"
                style={{ background: "var(--color-navy)" }}
              >
                <p className="text-sm opacity-70 mb-1">Sueldo neto a cobrar</p>
                <p className="text-4xl font-bold">{fmt(result.neto)}</p>
                <p className="text-xs opacity-60 mt-2">
                  Bruto total: {fmt(result.totalBruto)} · Aportes: {fmt(result.totalAportes)}
                </p>
              </div>

              {/* Deductions */}
              <div
                className="rounded-2xl border p-5"
                style={{ background: "white", borderColor: "var(--color-border-soft)" }}
              >
                <h3 className="font-bold text-sm mb-4" style={{ color: "var(--color-ink)" }}>
                  Composición del haberes
                </h3>
                <div className="space-y-2">
                  <ResultRow label="Básico remunerativo" value={fmt(result.bruto)} />
                  {result.horasExtra > 0 && (
                    <ResultRow label="Horas extra" value={fmt(result.horasExtra)} />
                  )}
                  {result.noRem > 0 && (
                    <ResultRow label="No remunerativo" value={fmt(result.noRem)} />
                  )}
                  <div className="border-t my-2" style={{ borderColor: "var(--color-border-soft)" }} />
                  <ResultRow label="Ap. jubilatorio SIPA (11%)" value={`-${fmt(result.aporteSIPA)}`} negative />
                  <ResultRow label="Ap. INSSJP — PAMI (3%)" value={`-${fmt(result.aporteINSSJP)}`} negative />
                  <ResultRow label={`Ap. obra social (${inputs.obraSocial}%)`} value={`-${fmt(result.aporteObraSocial)}`} negative />
                  {result.aporteSindicato > 0 && (
                    <ResultRow label={`Cuota sindical (${inputs.sindicato}%)`} value={`-${fmt(result.aporteSindicato)}`} negative />
                  )}
                </div>
              </div>

              {/* Employer cost */}
              <div
                className="rounded-2xl border p-5"
                style={{ background: "white", borderColor: "var(--color-border-soft)" }}
              >
                <h3 className="font-bold text-sm mb-4" style={{ color: "var(--color-ink)" }}>
                  Contribuciones patronales (estimadas)
                </h3>
                <div className="space-y-2">
                  <ResultRow label="Jubilación (10,17%)" value={fmt(result.patronalJubilacion)} />
                  <ResultRow label="INSSJP / PAMI (1,7%)" value={fmt(result.patronalINSSJP)} />
                  <ResultRow label="Obra social (6%)" value={fmt(result.patronalObraSocial)} />
                  <ResultRow label="Asign. familiares (0,9%)" value={fmt(result.patronalIAJO)} />
                  <ResultRow label="Fondo desempleo (0,5%)" value={fmt(result.patronalFNES)} />
                  <div className="border-t my-2" style={{ borderColor: "var(--color-border-soft)" }} />
                  <ResultRow label="Total costo empleador" value={fmt(result.costoEmpleador)} bold />
                </div>
              </div>

              <div
                className="flex items-start gap-2 p-3 rounded-xl border"
                style={{ background: "#fef3c7", borderColor: "#fde68a" }}
              >
                <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#92400e" }} />
                <p className="text-xs" style={{ color: "#92400e" }}>
                  Cálculo orientativo. Las contribuciones patronales varían según convenio colectivo, alícuota diferencial y SUSS. Verificar con el liquidador antes de presentar.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-muted)" }}>
        {label}
        {hint && <span className="font-normal ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function MoneyInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-muted)" }}>
        $
      </span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-7 pr-3 py-2 rounded-lg border text-sm outline-none"
        style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
      />
    </div>
  );
}

function ResultRow({ label, value, negative, bold }: { label: string; value: string; negative?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: "var(--color-muted)", fontWeight: bold ? "600" : undefined }}>{label}</span>
      <span
        style={{
          color: negative ? "#dc2626" : bold ? "var(--color-ink)" : "var(--color-ink)",
          fontWeight: bold ? "700" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}
