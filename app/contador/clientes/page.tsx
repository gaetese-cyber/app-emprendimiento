"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit3, X, Check, ChevronDown } from "lucide-react";

type Categoria = "monotributo" | "responsable_inscripto" | "exento" | "consumidor_final" | "otro";

interface Cliente {
  id: string;
  nombre: string;
  cuit: string;
  categoria: Categoria;
  email: string;
  telefono: string;
  notas: string;
  vencimiento: string;
}

const CATEGORIAS: Record<Categoria, { label: string; color: string }> = {
  monotributo: { label: "Monotributo", color: "#2d5d4e" },
  responsable_inscripto: { label: "Resp. Inscripto", color: "#1a3a52" },
  exento: { label: "Exento", color: "#a8763e" },
  consumidor_final: { label: "Cons. Final", color: "#475569" },
  otro: { label: "Otro", color: "#64748b" },
};

const STORAGE_KEY = "contaai_clientes_v1";

function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const EMPTY: Omit<Cliente, "id"> = {
  nombre: "",
  cuit: "",
  categoria: "monotributo",
  email: "",
  telefono: "",
  notas: "",
  vencimiento: "",
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Cliente, "id">>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setClientes(JSON.parse(raw));
    } catch {}
  }, []);

  function save(list: Cliente[]) {
    setClientes(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function openNew() {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(c: Cliente) {
    const { id, ...rest } = c;
    setForm(rest);
    setEditId(id);
    setShowForm(true);
  }

  function submit() {
    if (!form.nombre.trim() || !form.cuit.trim()) return;
    if (editId) {
      save(clientes.map((c) => (c.id === editId ? { ...form, id: editId } : c)));
    } else {
      save([{ ...form, id: newId() }, ...clientes]);
    }
    setShowForm(false);
    setEditId(null);
  }

  function remove(id: string) {
    save(clientes.filter((c) => c.id !== id));
    setDeleteId(null);
  }

  const filtered = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.cuit.includes(search),
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--color-bottle)" }}>
            Módulo
          </p>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-ink)", fontFamily: "var(--font-serif)" }}>
            Clientes
          </h1>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--color-navy)" }}
        >
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border mb-6"
        style={{ background: "white", borderColor: "var(--color-border)" }}
      >
        <Search size={16} style={{ color: "var(--color-muted)" }} />
        <input
          type="text"
          placeholder="Buscar por nombre o CUIT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none bg-transparent"
          style={{ color: "var(--color-ink)" }}
        />
        {search && (
          <button onClick={() => setSearch("")}>
            <X size={14} style={{ color: "var(--color-muted)" }} />
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl border"
          style={{ background: "white", borderColor: "var(--color-border-soft)" }}
        >
          <p className="font-semibold mb-1" style={{ color: "var(--color-ink)" }}>
            {search ? "Sin resultados" : "Todavía no hay clientes"}
          </p>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            {search ? "Probá con otro término." : "Hacé clic en \"Nuevo cliente\" para empezar."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--color-border-soft)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--color-cream)", borderBottom: "1px solid var(--color-border-soft)" }}>
                {["Nombre", "CUIT", "Categoría", "Próx. vencimiento", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  style={{
                    background: i % 2 === 0 ? "white" : "var(--color-bone)",
                    borderBottom: "1px solid var(--color-border-soft)",
                  }}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm" style={{ color: "var(--color-ink)" }}>{c.nombre}</p>
                    {c.email && <p className="text-xs" style={{ color: "var(--color-muted)" }}>{c.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--color-ink)" }}>
                    {c.cuit}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ background: CATEGORIAS[c.categoria]?.color ?? "#64748b" }}
                    >
                      {CATEGORIAS[c.categoria]?.label ?? c.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: c.vencimiento ? "var(--color-ink)" : "var(--color-muted)" }}>
                    {c.vencimiento ? new Date(c.vencimiento + "T00:00:00").toLocaleDateString("es-AR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-blue-50"
                        style={{ color: "var(--color-navy)" }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: "#dc2626" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs mt-4 text-center" style={{ color: "var(--color-muted)" }}>
        {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrado{clientes.length !== 1 ? "s" : ""}
      </p>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl"
            style={{ background: "white" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: "var(--color-ink)" }}>
                {editId ? "Editar cliente" : "Nuevo cliente"}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X size={20} style={{ color: "var(--color-muted)" }} />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Nombre o razón social *">
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                  placeholder="Ej: García Juan"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="CUIT *">
                  <input
                    type="text"
                    value={form.cuit}
                    onChange={(e) => setForm({ ...form, cuit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                    placeholder="20-12345678-9"
                  />
                </Field>
                <Field label="Categoría">
                  <div className="relative">
                    <select
                      value={form.categoria}
                      onChange={(e) => setForm({ ...form, categoria: e.target.value as Categoria })}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none appearance-none"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                    >
                      {Object.entries(CATEGORIAS).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-muted)" }} />
                  </div>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                    placeholder="cliente@mail.com"
                  />
                </Field>
                <Field label="Teléfono">
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                    placeholder="+54 9 11..."
                  />
                </Field>
              </div>
              <Field label="Próximo vencimiento">
                <input
                  type="date"
                  value={form.vencimiento}
                  onChange={(e) => setForm({ ...form, vencimiento: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                />
              </Field>
              <Field label="Notas">
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
                  placeholder="Observaciones, estado, pendientes..."
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
                disabled={!form.nombre.trim() || !form.cuit.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                style={{ background: "var(--color-navy)" }}
              >
                <Check size={16} /> {editId ? "Guardar" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: "white" }}>
            <h3 className="font-bold mb-2" style={{ color: "var(--color-ink)" }}>¿Eliminar cliente?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
              Esta acción no se puede deshacer.
            </p>
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
