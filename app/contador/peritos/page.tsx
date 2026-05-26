"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, X, Check, ChevronDown, Scale } from "lucide-react";

type Tipo = "perito" | "sindico";
type Estado = "activo" | "cerrado" | "suspendido";

interface Expediente {
  id: string;
  numero: string;
  caratula: string;
  juzgado: string;
  tipo: Tipo;
  estado: Estado;
  proximaFecha: string;
  honorarios: string;
  notas: string;
}

const ESTADOS: Record<Estado, { label: string; color: string; bg: string }> = {
  activo: { label: "Activo", color: "#166534", bg: "#dcfce7" },
  cerrado: { label: "Cerrado", color: "#475569", bg: "#f1f5f9" },
  suspendido: { label: "Suspendido", color: "#92400e", bg: "#fef3c7" },
};

const STORAGE_KEY = "contaai_peritos_v1";

function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const EMPTY: Omit<Expediente, "id"> = {
  numero: "",
  caratula: "",
  juzgado: "",
  tipo: "perito",
  estado: "activo",
  proximaFecha: "",
  honorarios: "",
  notas: "",
};

export default function PeritosPage() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Expediente, "id">>(EMPTY);
  const [filtroEstado, setFiltroEstado] = useState<Estado | "todos">("todos");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setExpedientes(JSON.parse(raw));
    } catch {}
  }, []);

  function save(list: Expediente[]) {
    setExpedientes(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function openNew() {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(e: Expediente) {
    const { id, ...rest } = e;
    setForm(rest);
    setEditId(id);
    setShowForm(true);
  }

  function submit() {
    if (!form.caratula.trim()) return;
    if (editId) {
      save(expedientes.map((e) => (e.id === editId ? { ...form, id: editId } : e)));
    } else {
      save([{ ...form, id: newId() }, ...expedientes]);
    }
    setShowForm(false);
  }

  function remove(id: string) {
    save(expedientes.filter((e) => e.id !== id));
    setDeleteId(null);
  }

  const filtered =
    filtroEstado === "todos"
      ? expedientes
      : expedientes.filter((e) => e.estado === filtroEstado);

  const activos = expedientes.filter((e) => e.estado === "activo").length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--color-bottle)" }}>
            Módulo
          </p>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-ink)", fontFamily: "var(--font-serif)" }}>
            Peritos y Síndicos
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            {activos} expediente{activos !== 1 ? "s" : ""} activo{activos !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "var(--color-bottle)" }}
        >
          <Plus size={16} /> Nuevo expediente
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["todos", "activo", "cerrado", "suspendido"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltroEstado(f)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
            style={
              filtroEstado === f
                ? { background: "var(--color-bottle)", color: "white", borderColor: "var(--color-bottle)" }
                : { background: "white", color: "var(--color-muted)", borderColor: "var(--color-border)" }
            }
          >
            {f === "todos" ? "Todos" : ESTADOS[f].label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border-soft)" }}
        >
          <Scale size={40} className="mb-3 opacity-20" style={{ color: "var(--color-bottle)" }} />
          <p className="font-semibold mb-1" style={{ color: "var(--color-ink)" }}>
            Sin expedientes
          </p>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Agregá tu primer expediente con el botón superior.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((exp) => (
            <div
              key={exp.id}
              className="rounded-2xl border p-5"
              style={{ background: "white", borderColor: "var(--color-border-soft)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: ESTADOS[exp.estado].bg, color: ESTADOS[exp.estado].color }}
                    >
                      {ESTADOS[exp.estado].label}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "var(--color-cream)", color: "var(--color-navy)" }}
                    >
                      {exp.tipo === "perito" ? "Perito" : "Síndico"}
                    </span>
                    {exp.numero && (
                      <span className="text-xs font-mono" style={{ color: "var(--color-muted)" }}>
                        Exp. {exp.numero}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold" style={{ color: "var(--color-ink)" }}>
                    {exp.caratula}
                  </h3>
                  {exp.juzgado && (
                    <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
                      {exp.juzgado}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {exp.proximaFecha && (
                      <p className="text-xs font-medium" style={{ color: "var(--color-bottle)" }}>
                        Próxima fecha: {new Date(exp.proximaFecha + "T00:00:00").toLocaleDateString("es-AR")}
                      </p>
                    )}
                    {exp.honorarios && (
                      <p className="text-xs font-medium" style={{ color: "var(--color-earth)" }}>
                        Hon.: ${parseFloat(exp.honorarios).toLocaleString("es-AR")}
                      </p>
                    )}
                  </div>
                  {exp.notas && (
                    <p className="text-xs mt-2 p-2 rounded-lg" style={{ background: "var(--color-cream)", color: "var(--color-muted)" }}>
                      {exp.notas}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(exp)}
                    className="p-2 rounded-lg transition-colors hover:bg-blue-50"
                    style={{ color: "var(--color-navy)" }}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteId(exp.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-red-50"
                    style={{ color: "#dc2626" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ background: "white" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: "var(--color-ink)" }}>
                {editId ? "Editar expediente" : "Nuevo expediente"}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X size={20} style={{ color: "var(--color-muted)" }} />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Carátula *">
                <input
                  type="text"
                  value={form.caratula}
                  onChange={(e) => setForm({ ...form, caratula: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                  placeholder="Ej: García c/ Empresa SA s/ cobro de pesos"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo">
                  <div className="relative">
                    <select
                      value={form.tipo}
                      onChange={(e) => setForm({ ...form, tipo: e.target.value as Tipo })}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none appearance-none"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                    >
                      <option value="perito">Perito</option>
                      <option value="sindico">Síndico</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-muted)" }} />
                  </div>
                </Field>
                <Field label="Estado">
                  <div className="relative">
                    <select
                      value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value as Estado })}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none appearance-none"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                    >
                      <option value="activo">Activo</option>
                      <option value="cerrado">Cerrado</option>
                      <option value="suspendido">Suspendido</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-muted)" }} />
                  </div>
                </Field>
              </div>

              <Field label="Número de expediente">
                <input
                  type="text"
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                  placeholder="Ej: 12345/2024"
                />
              </Field>

              <Field label="Juzgado / Tribunal">
                <input
                  type="text"
                  value={form.juzgado}
                  onChange={(e) => setForm({ ...form, juzgado: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                  placeholder="Ej: Juzgado Civil Nº 3 - CABA"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Próxima fecha">
                  <input
                    type="date"
                    value={form.proximaFecha}
                    onChange={(e) => setForm({ ...form, proximaFecha: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                  />
                </Field>
                <Field label="Honorarios ($)">
                  <input
                    type="number"
                    min="0"
                    value={form.honorarios}
                    onChange={(e) => setForm({ ...form, honorarios: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                    placeholder="0"
                  />
                </Field>
              </div>

              <Field label="Notas">
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                  placeholder="Estado del proceso, pendientes, observaciones..."
                />
              </Field>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium"
                style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                disabled={!form.caratula.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: "var(--color-bottle)" }}
              >
                <Check size={16} /> {editId ? "Guardar" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: "white" }}>
            <h3 className="font-bold mb-2" style={{ color: "var(--color-ink)" }}>¿Eliminar expediente?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium"
                style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => remove(deleteId)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{ background: "#dc2626" }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
