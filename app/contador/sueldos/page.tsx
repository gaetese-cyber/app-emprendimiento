"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, UserCheck, FileText, Download, Plus, ChevronRight, Building2 } from "lucide-react";
import { getEmpleadores } from "./lib/storage";
import type { Empleador } from "./lib/types";

const ACCIONES = [
  { href: "/contador/sueldos/empleadores", label: "Empleadores", desc: "Alta y gestión de empresas/clientes", icon: Building2, color: "var(--color-navy)" },
  { href: "/contador/sueldos/empleados", label: "Empleados", desc: "Personal por empresa y categoría CCT", icon: Users, color: "var(--color-bottle)" },
  { href: "/contador/sueldos/liquidar", label: "Liquidar sueldos", desc: "Calcular y generar recibos mensuales", icon: FileText, color: "var(--color-earth)" },
  { href: "/contador/sueldos/arca", label: "Exportar para ARCA", desc: "Generar TXT F.931 SICOSS", icon: Download, color: "#6d28d9" },
];

export default function SueldosHub() {
  const [empleadores, setEmpleadores] = useState<Empleador[]>([]);

  useEffect(() => {
    setEmpleadores(getEmpleadores());
  }, []);

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
          CCT 130/75 · 76/75 · 389/04 · UOM — Recibos + TXT ARCA
        </p>
      </div>

      {/* Quick stats */}
      {empleadores.length > 0 && (
        <div className="flex items-center gap-4 mb-8 p-4 rounded-xl border" style={{ background: "white", borderColor: "var(--color-border-soft)" }}>
          <Building2 size={20} style={{ color: "var(--color-navy)" }} />
          <p className="text-sm" style={{ color: "var(--color-ink)" }}>
            <strong>{empleadores.length}</strong> empleador{empleadores.length !== 1 ? "es" : ""} cargado{empleadores.length !== 1 ? "s" : ""}
          </p>
          <Link
            href="/contador/sueldos/liquidar"
            className="ml-auto flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white"
            style={{ background: "var(--color-earth)" }}
          >
            <Plus size={15} /> Nueva liquidación
          </Link>
        </div>
      )}

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {ACCIONES.map(({ href, label, desc, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 p-5 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: "white", borderColor: "var(--color-border-soft)" }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + "18" }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: "var(--color-ink)" }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{desc}</p>
            </div>
            <ChevronRight size={16} className="flex-shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--color-muted)" }} />
          </Link>
        ))}
      </div>

      {/* Workflow guide */}
      <div className="rounded-2xl border p-6" style={{ background: "white", borderColor: "var(--color-border-soft)" }}>
        <h2 className="font-bold mb-4" style={{ color: "var(--color-ink)" }}>Flujo de trabajo mensual</h2>
        <div className="space-y-3">
          {[
            { n: "1", text: "Cargá el empleador (empresa) y sus empleados con categoría CCT — se hace una sola vez." },
            { n: "2", text: "Cada mes abrís \"Liquidar sueldos\", seleccionás el período y generás el recibo de cada empleado." },
            { n: "3", text: "Desde \"Exportar para ARCA\" generás el TXT F.931 SICOSS listo para importar." },
          ].map(({ n, text }) => (
            <div key={n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: "var(--color-navy)" }}>{n}</span>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
