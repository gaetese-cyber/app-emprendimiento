"use client";

import AIChat from "../components/AIChat";
import { Building2, CheckCircle2 } from "lucide-react";

const SUGGESTIONS = [
  "¿Qué tipo societario conviene para un emprendimiento unipersonal?",
  "¿Cuáles son los pasos para constituir una SAS?",
  "¿Qué capital mínimo requiere una SA?",
  "¿Cuál es la diferencia entre SRL y SA en responsabilidad?",
  "¿Qué libros societarios obligatorios tiene una SRL?",
  "¿Cómo se hace la inscripción en IGJ?",
];

const COMPARATIVA = [
  {
    tipo: "SAS",
    fullName: "Sociedad por Acciones Simplificada",
    ley: "Ley 27.349",
    socios: "1 o más",
    capital: "2 salarios mínimos",
    pros: "Trámite 100% digital, rápida, económica",
    contras: "No para grandes inversiones, límites de facturación",
    color: "var(--color-bottle)",
  },
  {
    tipo: "SRL",
    fullName: "Sociedad de Responsabilidad Limitada",
    ley: "Ley 19.550",
    socios: "2 a 50",
    capital: "Sin mínimo legal",
    pros: "Flexible, habitual para PyMEs",
    contras: "Más trámites que SAS, requiere escribano",
    color: "var(--color-navy)",
  },
  {
    tipo: "SA",
    fullName: "Sociedad Anónima",
    ley: "Ley 19.550",
    socios: "2 o más",
    capital: "$100.000 (autorizado)",
    pros: "Transmisibilidad de acciones, financiamiento",
    contras: "Más costosa, mayor burocracia, directorio",
    color: "var(--color-earth)",
  },
  {
    tipo: "Unipersonal",
    fullName: "Sociedad Anónima Unipersonal",
    ley: "Ley 19.550 art. 1",
    socios: "1",
    capital: "100% integrado al acto",
    pros: "Un solo socio, resp. limitada",
    contras: "Fiscalización estatal permanente, costosa",
    color: "#64748b",
  },
];

const PASOS_SAS = [
  "Reservar nombre en el portal TAD (trámites a distancia)",
  "Redactar el instrumento constitutivo (modelo oficial disponible online)",
  "Integrar el capital inicial (mín. 2 SMVM) en cuenta bancaria",
  "Tramitar CUIT provisorio ante AFIP",
  "Inscribir ante el Registro Público correspondiente (IGJ o provincial)",
  "Obtener CUIT definitivo y dar de alta en AFIP",
  "Abrir cuenta bancaria a nombre de la sociedad",
  "Inscribir en Ingresos Brutos (AGIP / ARBA / provincial)",
];

export default function SociedadesPage() {
  return (
    <div className="flex h-screen flex-col">
      <div
        className="px-8 py-5 border-b"
        style={{ borderColor: "var(--color-border-soft)", background: "white" }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--color-earth)" }}>
          Módulo IA
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-ink)", fontFamily: "var(--font-serif)" }}>
          Constitución de Sociedades
        </h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AIChat
            module="sociedades"
            placeholder="Preguntá sobre tipos societarios, trámites, IGJ..."
            suggestions={SUGGESTIONS}
            systemLabel="Asistente Societario"
          />
        </div>

        {/* Sidebar */}
        <aside
          className="w-80 flex-shrink-0 border-l overflow-y-auto"
          style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bone)" }}
        >
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} style={{ color: "var(--color-earth)" }} />
              <h2 className="text-sm font-bold" style={{ color: "var(--color-ink)" }}>
                Comparativa de tipos societarios
              </h2>
            </div>

            <div className="space-y-3 mb-6">
              {COMPARATIVA.map((s) => (
                <div
                  key={s.tipo}
                  className="p-3 rounded-xl border"
                  style={{ background: "white", borderColor: "var(--color-border-soft)" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: s.color }}
                    >
                      {s.tipo}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-muted)" }}>{s.ley}</span>
                  </div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-ink)" }}>
                    {s.fullName}
                  </p>
                  <div className="text-xs space-y-0.5" style={{ color: "var(--color-muted)" }}>
                    <p>Socios: {s.socios}</p>
                    <p>Capital: {s.capital}</p>
                  </div>
                  <div className="mt-2 text-xs space-y-0.5">
                    <p className="text-green-700">✓ {s.pros}</p>
                    <p style={{ color: "#92400e" }}>✗ {s.contras}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="p-3 rounded-xl border"
              style={{ background: "white", borderColor: "var(--color-border-soft)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} style={{ color: "var(--color-bottle)" }} />
                <h3 className="text-xs font-bold" style={{ color: "var(--color-ink)" }}>
                  Pasos para constituir una SAS
                </h3>
              </div>
              <ol className="space-y-2">
                {PASOS_SAS.map((paso, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--color-muted)" }}>
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0 text-xs font-bold mt-0.5"
                      style={{ background: "var(--color-bottle)", fontSize: "10px" }}
                    >
                      {i + 1}
                    </span>
                    {paso}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
