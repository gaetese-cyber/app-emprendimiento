"use client";

import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, X, Check, Building2 } from "lucide-react";
import { getEmpleadores, saveEmpleadores, addEmpleador, updateEmpleador, deleteEmpleador } from "../lib/storage";
import type { Empleador } from "../lib/types";

const EMPTY: Omit<Empleador, "id"> = {
  razonSocial: "",
  cuit: "",
  domicilio: "",
  localidad: "",
  provincia: "Santa Fe",
  actividadCIIU: "",
};

export default function EmpleadoresPage() {
  const [lista, setLista] = useState<Empleador[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Empleador, "id">>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { setLista(getEmpleadores()); }, []);

  function refresh() { setLista(getEmpleadores()); }

  function openNew() { setForm(EMPTY); setEditId(null); setShowForm(true); }
  function openEdit(e: Empleador) { const { id, ...rest } = e; setForm(rest); setEditId(id); setShowForm(true); }

  function submit() {
    if (!form.razonSocial.trim() || !form.cuit.trim()) return;
    if (editId) { updateEmpleador(editId, form); } else { addEmpleador(form); }
    setShowForm(false);
    refresh();
  }

  function remove(id: string) { deleteEmpleador(id); setDeleteId(null); refresh(); }

  const set = (f: keyof typeof EMPTY, v: string) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--color-navy)" }}>Sueldos</p>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-ink)", fontFamily: "var(--font-serif)" }}>Empleadores</h1>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--color-navy)" }}>
          <Plus size={16} /> Nuevo empleador
        </button>
      </div>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border" style={{ background: "white", borderColor: "var(--color-border-soft)" }}>
          <Building2 size={40} className="mb-3 opacity-20" style={{ color: "var(--color-navy)" }} />
          <p className="font-semibold mb-1" style={{ color: "var(--color-ink)" }}>Sin empleadores</p>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>Agregá el primer empleador (empresa o cliente).</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map((e) => (
            <div key={e.id} className="flex items-center gap-4 p-5 rounded-2xl border" style={{ background: "white", borderColor: "var(--color-border-soft)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--color-navy)" }}>
                <Building2 size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold" style={{ color: "var(--color-ink)" }}>{e.razonSocial}</p>
                <p className="text-sm font-mono" style={{ color: "var(--color-muted)" }}>{e.cuit}</p>
                {e.localidad && <p className="text-xs" style={{ color: "var(--color-muted)" }}>{e.localidad}, {e.provincia}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(e)} className="p-2 rounded-lg hover:bg-blue-50" style={{ color: "var(--color-navy)" }}><Edit3 size={15} /></button>
                <button onClick={() => setDeleteId(e.id)} className="p-2 rounded-lg hover:bg-red-50" style={{ color: "#dc2626" }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-lg rounded-2xl p-6 shadow-2xl" style={{ background: "white" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: "var(--color-ink)" }}>{editId ? "Editar empleador" : "Nuevo empleador"}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} style={{ color: "var(--color-muted)" }} /></button>
            </div>
            <div className="space-y-4">
              <F label="Razón social *"><input value={form.razonSocial} onChange={(e) => set("razonSocial", e.target.value)} className="inp" placeholder="Empresa SA" /></F>
              <F label="CUIT *"><input value={form.cuit} onChange={(e) => set("cuit", e.target.value)} className="inp font-mono" placeholder="30-12345678-9" /></F>
              <F label="Domicilio"><input value={form.domicilio} onChange={(e) => set("domicilio", e.target.value)} className="inp" placeholder="Av. Corrientes 1234" /></F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Localidad"><input value={form.localidad} onChange={(e) => set("localidad", e.target.value)} className="inp" placeholder="Rosario" /></F>
                <F label="Provincia"><input value={form.provincia} onChange={(e) => set("provincia", e.target.value)} className="inp" /></F>
              </div>
              <F label="Actividad (CIIU)"><input value={form.actividadCIIU} onChange={(e) => set("actividadCIIU", e.target.value)} className="inp" placeholder="4711 — Comercio al por menor" /></F>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>Cancelar</button>
              <button onClick={submit} disabled={!form.razonSocial.trim() || !form.cuit.trim()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: "var(--color-navy)" }}>
                <Check size={16} /> {editId ? "Guardar" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: "white" }}>
            <h3 className="font-bold mb-2" style={{ color: "var(--color-ink)" }}>¿Eliminar empleador?</h3>
            <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>Se eliminarán también sus empleados y liquidaciones.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-lg border text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>Cancelar</button>
              <button onClick={() => remove(deleteId)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "#dc2626" }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-muted)" }}>{label}</label>
      {children}
    </div>
  );
}
