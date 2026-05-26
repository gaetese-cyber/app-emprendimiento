"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calculator,
  BookOpen,
  Scale,
  Building2,
  ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/contador", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/contador/clientes", label: "Clientes", icon: Users },
  { href: "/contador/facturacion", label: "Facturación / AFIP", icon: FileText },
  { href: "/contador/sueldos", label: "Sueldos", icon: Calculator },
  { href: "/contador/contabilidad", label: "Contabilidad", icon: BookOpen },
  { href: "/contador/peritos", label: "Peritos y Síndicos", icon: Scale },
  { href: "/contador/sociedades", label: "Sociedades", icon: Building2 },
];

export default function ContadorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-cream)" }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col border-r"
        style={{ background: "var(--color-navy)", borderColor: "var(--color-navy-dark)" }}
      >
        <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <Link href="/contador" className="block">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-300 mb-1">
              ContaAI
            </p>
            <h1 className="text-white font-bold text-lg leading-tight">
              Panel del Contador
            </h1>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: active ? "white" : "rgba(255,255,255,0.65)",
                  background: active ? "rgba(255,255,255,0.15)" : "transparent",
                }}
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="opacity-60" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            ← Volver al inicio
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
