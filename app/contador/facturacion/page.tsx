"use client";

import AIChat from "../components/AIChat";
import { CalendarDays, AlertCircle } from "lucide-react";

const SUGGESTIONS = [
  "¿Cuándo vence el IVA para Responsables Inscriptos?",
  "¿Cómo recategorizo un cliente en monotributo?",
  "¿Qué es la RG 5616 de AFIP?",
  "¿Cuándo hay que presentar Ganancias persona humana?",
  "¿Cómo se emite una nota de crédito electrónica?",
  "¿Qué retenciones aplican en una locación de servicios?",
];

const VENCIMIENTOS = [
  { concepto: "IVA — Declaración jurada mensual", terminacion: "0-1", fecha: "Día 18 del mes siguiente" },
  { concepto: "IVA — Declaración jurada mensual", terminacion: "2-3", fecha: "Día 19 del mes siguiente" },
  { concepto: "IVA — Declaración jurada mensual", terminacion: "4-5", fecha: "Día 20 del mes siguiente" },
  { concepto: "IVA — Declaración jurada mensual", terminacion: "6-7", fecha: "Día 21 del mes siguiente" },
  { concepto: "IVA — Declaración jurada mensual", terminacion: "8-9", fecha: "Día 22 del mes siguiente" },
  { concepto: "Monotributo — Pago mensual", terminacion: "—", fecha: "Último día hábil del mes" },
  { concepto: "Ganancias — Anticipo bimestral", terminacion: "0-9", fecha: "Según calendario AFIP" },
  { concepto: "Bienes Personales — DDJJ anual", terminacion: "0-9", fecha: "Junio del año siguiente" },
];

export default function FacturacionPage() {
  return (
    <div className="flex h-screen flex-col">
      <div
        className="px-8 py-5 border-b"
        style={{ borderColor: "var(--color-border-soft)", background: "white" }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--color-bottle)" }}>
          Módulo IA
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-ink)", fontFamily: "var(--font-serif)" }}>
          Facturación y AFIP
        </h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AIChat
            module="facturacion"
            placeholder="Consultá sobre AFIP, IVA, Ganancias, monotributo..."
            suggestions={SUGGESTIONS}
            systemLabel="Asistente AFIP & Facturación"
          />
        </div>

        {/* Sidebar */}
        <aside
          className="w-72 flex-shrink-0 border-l overflow-y-auto"
          style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bone)" }}
        >
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={16} style={{ color: "var(--color-navy)" }} />
              <h2 className="text-sm font-bold" style={{ color: "var(--color-ink)" }}>
                Vencimientos habituales
              </h2>
            </div>
            <div className="space-y-3">
              {VENCIMIENTOS.map((v, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border"
                  style={{ background: "white", borderColor: "var(--color-border-soft)" }}
                >
                  <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-ink)" }}>
                    {v.concepto}
                  </p>
                  {v.terminacion !== "—" && (
                    <p className="text-xs mb-0.5" style={{ color: "var(--color-muted)" }}>
                      Term. CUIT: {v.terminacion}
                    </p>
                  )}
                  <p className="text-xs font-medium" style={{ color: "var(--color-bottle)" }}>
                    {v.fecha}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="flex items-start gap-2 mt-5 p-3 rounded-xl border"
              style={{ background: "#fef3c7", borderColor: "#fde68a" }}
            >
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#92400e" }} />
              <p className="text-xs" style={{ color: "#92400e" }}>
                Las fechas pueden variar. Verificar siempre en{" "}
                <strong>afip.gob.ar/calendariofiscal</strong> antes de presentar.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
