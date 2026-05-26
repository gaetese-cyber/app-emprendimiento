"use client";

import AIChat from "../components/AIChat";
import { BookOpen } from "lucide-react";

const SUGGESTIONS = [
  "¿Cómo se contabiliza una compra de mercadería con IVA?",
  "¿Qué diferencia hay entre RT 9 y RT 16?",
  "¿Cómo registro un ajuste por inflación?",
  "¿Cuál es el asiento de cierre de ejercicio?",
  "¿Cómo valúo bienes de uso según normas FACPCE?",
  "¿Qué cuentas van al Estado de Resultados?",
];

const QUICK_REF = [
  {
    titulo: "Asiento tipo — Compra con IVA",
    lines: [
      "Db Mercaderías xxxxxx",
      "Db IVA CF xxxxxx",
      "   Cr Proveedores xxxxxx",
    ],
  },
  {
    titulo: "Asiento tipo — Venta con IVA",
    lines: [
      "Db Clientes xxxxxx",
      "   Cr Ventas xxxxxx",
      "   Cr IVA DV xxxxxx",
    ],
  },
  {
    titulo: "Asiento tipo — Pago de sueldo",
    lines: [
      "Db Sueldos y Jornales xxxxxx",
      "   Cr Sueldos a Pagar xxxxxx",
      "   Cr Aportes Retenidos xxxxxx",
    ],
  },
];

export default function ContabilidadPage() {
  return (
    <div className="flex h-screen flex-col">
      <div
        className="px-8 py-5 border-b"
        style={{ borderColor: "var(--color-border-soft)", background: "white" }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--color-navy)" }}>
          Módulo IA
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-ink)", fontFamily: "var(--font-serif)" }}>
          Contabilidad General
        </h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AIChat
            module="contabilidad"
            placeholder="Preguntá sobre asientos, balances, normas FACPCE..."
            suggestions={SUGGESTIONS}
            systemLabel="Asistente de Contabilidad"
          />
        </div>

        {/* Sidebar */}
        <aside
          className="w-72 flex-shrink-0 border-l overflow-y-auto"
          style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bone)" }}
        >
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} style={{ color: "var(--color-navy)" }} />
              <h2 className="text-sm font-bold" style={{ color: "var(--color-ink)" }}>
                Asientos de referencia
              </h2>
            </div>
            <div className="space-y-3">
              {QUICK_REF.map((r) => (
                <div
                  key={r.titulo}
                  className="p-3 rounded-xl border"
                  style={{ background: "white", borderColor: "var(--color-border-soft)" }}
                >
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-ink)" }}>
                    {r.titulo}
                  </p>
                  <div className="space-y-0.5">
                    {r.lines.map((line, i) => (
                      <p key={i} className="text-xs font-mono" style={{ color: "var(--color-muted)" }}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3 rounded-xl border" style={{ background: "white", borderColor: "var(--color-border-soft)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-ink)" }}>
                Normas principales
              </p>
              <ul className="text-xs space-y-1" style={{ color: "var(--color-muted)" }}>
                {[
                  "RT 9 — Normas contables generales",
                  "RT 16 — Marco conceptual",
                  "RT 17 — Normas de registro",
                  "RT 39 — Ajuste por inflación",
                  "RT 41 — Normas para PyMEs",
                  "NIC/NIIF — Para empresas cotizantes",
                ].map((n) => (
                  <li key={n} className="flex items-start gap-1.5">
                    <span className="mt-0.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: "var(--color-navy)" }} />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
