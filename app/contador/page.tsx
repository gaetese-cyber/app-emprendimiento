"use client";

import Link from "next/link";
import {
  Users,
  FileText,
  Calculator,
  BookOpen,
  Scale,
  Building2,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

const MODULES = [
  {
    href: "/contador/clientes",
    label: "Clientes y Expedientes",
    description: "ABM de clientes, CUIT, categoría impositiva y vencimientos próximos.",
    icon: Users,
    color: "#1a3a52",
    badge: null,
  },
  {
    href: "/contador/facturacion",
    label: "Facturación / AFIP",
    description: "Asistente IA para AFIP, IVA, Ganancias, monotributo y vencimientos fiscales.",
    icon: FileText,
    color: "#2d5d4e",
    badge: "IA",
  },
  {
    href: "/contador/sueldos",
    label: "Liquidación de Sueldos",
    description: "Calculadora de haberes, cargas sociales, recibos y horas extra.",
    icon: Calculator,
    color: "#a8763e",
    badge: null,
  },
  {
    href: "/contador/contabilidad",
    label: "Contabilidad General",
    description: "Asistente IA para asientos, balances, ajuste por inflación y normas FACPCE.",
    icon: BookOpen,
    color: "#1a3a52",
    badge: "IA",
  },
  {
    href: "/contador/peritos",
    label: "Peritos y Síndicos",
    description: "Gestión ordenada de expedientes judiciales, fechas clave y honorarios.",
    icon: Scale,
    color: "#2d5d4e",
    badge: null,
  },
  {
    href: "/contador/sociedades",
    label: "Constitución de Sociedades",
    description: "Guía IA para SA, SRL, SAS, unipersonal e inscripción ante IGJ o registros provinciales.",
    icon: Building2,
    color: "#a8763e",
    badge: "IA",
  },
];

const STATS = [
  { label: "Módulos disponibles", value: "6", icon: TrendingUp },
  { label: "Asistentes IA", value: "3", icon: CheckCircle2 },
  { label: "Actualizaciones 2025", value: "Al día", icon: Clock },
];

export default function ContadorDashboard() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--color-bottle)" }}>
          Panel principal
        </p>
        <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--color-ink)", fontFamily: "var(--font-serif)" }}>
          Hola, bienvenido/a
        </h1>
        <p className="text-lg" style={{ color: "var(--color-muted)" }}>
          Todas tus herramientas profesionales en un solo lugar.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {STATS.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 p-5 rounded-xl border"
            style={{ background: "white", borderColor: "var(--color-border-soft)" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--color-cream)" }}
            >
              <Icon size={20} style={{ color: "var(--color-navy)" }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--color-ink)" }}>{value}</p>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Module grid */}
      <h2 className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: "var(--color-muted)" }}>
        Módulos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MODULES.map(({ href, label, description, icon: Icon, color, badge }) => (
          <Link
            key={href}
            href={href}
            className="group relative flex flex-col p-6 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "white", borderColor: "var(--color-border-soft)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: color + "18" }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              {badge && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "var(--color-bottle)", color: "white" }}
                >
                  {badge}
                </span>
              )}
            </div>
            <h3 className="font-semibold mb-2" style={{ color: "var(--color-ink)" }}>
              {label}
            </h3>
            <p className="text-sm flex-1" style={{ color: "var(--color-muted)" }}>
              {description}
            </p>
            <div
              className="flex items-center gap-1 mt-4 text-sm font-medium transition-all group-hover:gap-2"
              style={{ color }}
            >
              Abrir <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
