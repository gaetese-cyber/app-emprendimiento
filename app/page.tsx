"use client";

import { useState, useRef, useEffect } from "react";
import IdeaSelector from "./components/IdeaSelector";
import PresupuestoInicial from "./components/PresupuestoInicial";
import LocalHabilitaciones from "./components/LocalHabilitaciones";
import ProveedoresMarketing from "./components/ProveedoresMarketing";
import PlanAccion from "./components/PlanAccion";
import CalculadoraPrecio from "./components/CalculadoraPrecio";
import PuntoEquilibrio from "./components/PuntoEquilibrio";
import ResumenFinal from "./components/ResumenFinal";

interface Mensaje {
  role: "user" | "assistant";
  content: string;
}

interface DatosExtraidos {
  capital: string;
  zona: string;
  intereses: string;
  localPropio: string;
  modalidad: string;
  horasDiarias: string;
}

const FRASE_FIN = ["ya tengo todo", "plan personalizado", "botón de abajo", "tocá el botón"];

function nicoTermino(texto: string) {
  return FRASE_FIN.some((f) => texto.toLowerCase().includes(f));
}

export default function Home() {
  const [fase, setFase] = useState<"landing" | "chat" | "form">("landing");
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy Nico, tu asesor de negocios 👋\n\nEstoy acá para ayudarte a encontrar el negocio ideal para vos — aunque nunca hayas tenido uno antes.\n\nVoy a hacerte unas pocas preguntas y después te armo un plan completo con ideas reales, costos actuales y pasos concretos para arrancar.\n\nPara empezar, contame: ¿En qué estás hoy? ¿Trabajás, buscás un ingreso extra o querés independizarte?",
    },
  ]);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [chatListo, setChatListo] = useState(false);
  const [extrayendo, setExtrayendo] = useState(false);
  const [datos, setDatos] = useState<DatosExtraidos>({
    capital: "",
    zona: "",
    intereses: "",
    localPropio: "no",
    modalidad: "solo",
    horasDiarias: "8",
  });
  const [ideasTexto, setIdeasTexto] = useState("");
  const [ideaElegida, setIdeaElegida] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, chatListo]);

  async function enviarMensaje() {
    if (!input.trim() || enviando) return;
    const nuevosMensajes: Mensaje[] = [
      ...mensajes,
      { role: "user", content: input.trim() },
    ];
    setMensajes(nuevosMensajes);
    setInput("");
    setEnviando(true);

    const respuesta = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: nuevosMensajes }),
    });

    const reader = respuesta.body!.getReader();
    const decoder = new TextDecoder();
    let texto = "";

    setMensajes((prev) => [...prev, { role: "assistant", content: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      texto += decoder.decode(value, { stream: true });
      setMensajes((prev) => {
        const copia = [...prev];
        copia[copia.length - 1] = { role: "assistant", content: texto };
        return copia;
      });
    }

    setEnviando(false);
    if (nicoTermino(texto)) setChatListo(true);
  }

  async function irAlFormulario() {
    setExtrayendo(true);
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: mensajes }),
    });
    const extraido = await res.json();
    setDatos({
      capital: extraido.capital || "",
      zona: extraido.zona || "",
      intereses: extraido.intereses || "",
      localPropio: extraido.localPropio || "no",
      modalidad: extraido.modalidad || "solo",
      horasDiarias: extraido.horasDiarias || "8",
    });
    setExtrayendo(false);
    setFase("form");
  }

  function irDirectoAlFormulario() {
    setFase("form");
  }

  if (fase === "landing") {
    return (
      <main className="min-h-screen text-white overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>

        {/* HERO */}
        <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">

          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 tracking-wide uppercase" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Gratis · Sin registrarse · 100% en español
          </div>

          <h1 className="text-4xl font-extrabold leading-tight max-w-2xl mb-4">
            Encontrá tu{" "}
            <span style={{ color: '#60a5fa' }}>negocio ideal</span>{" "}
            y arrancá ya
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
            Respondé unas pocas preguntas y recibís un plan personalizado con ideas reales,
            costos actualizados y pasos concretos — hecho para Argentina 2026.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              onClick={() => setFase("chat")}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl text-sm transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <span className="text-lg">💬</span> Hablar con Nico
            </button>
            <button
              onClick={() => setFase("form")}
              className="flex-1 text-white font-semibold py-4 rounded-2xl text-sm transition flex items-center justify-center gap-2"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <span className="text-lg">📋</span> Ir al formulario
            </button>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="px-6 py-12 max-w-3xl mx-auto">
          <h2 className="text-center text-xl font-bold text-white mb-8">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: "1", icon: "💬", title: "Contale tu situación", desc: "Nico te hace preguntas simples sobre tu capital, zona e intereses." },
              { n: "2", icon: "✨", title: "Recibís ideas personalizadas", desc: "La IA analiza tu perfil y genera ideas de negocio reales para vos." },
              { n: "3", icon: "📄", title: "Descargás tu plan completo", desc: "Presupuesto, proveedores, marketing y plan semana a semana en PDF." },
            ].map((paso) => (
              <div key={paso.n} className="rounded-2xl p-5 flex flex-col items-center text-center gap-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">{paso.n}</div>
                <div className="text-2xl">{paso.icon}</div>
                <h3 className="font-semibold text-white text-sm">{paso.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{paso.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* QUÉ INCLUYE */}
        <section className="px-6 py-10 max-w-3xl mx-auto">
          <h2 className="text-center text-xl font-bold text-white mb-8">¿Qué incluye tu plan?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: "💡", title: "Ideas de negocio", desc: "Adaptadas a tu capital y zona" },
              { icon: "💰", title: "Presupuesto real", desc: "Costos actualizados 2026" },
              { icon: "🏪", title: "Local y habilitaciones", desc: "Trámites y permisos necesarios" },
              { icon: "📦", title: "Proveedores", desc: "Dónde comprar más barato" },
              { icon: "📣", title: "Marketing", desc: "Cómo conseguir tus primeros clientes" },
              { icon: "📅", title: "Plan semana a semana", desc: "Tareas concretas para arrancar" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl p-4 transition" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                <p className="text-slate-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PROFESIONALES */}
        <section className="px-6 py-10 max-w-3xl mx-auto">
          <h2 className="text-center text-xl font-bold text-white mb-2">Respaldo profesional</h2>
          <p className="text-center text-slate-400 text-sm mb-8">¿Necesitás ayuda con la parte contable o de marketing? Contactate directamente.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">JL</div>
                <div>
                  <p className="font-semibold text-white text-sm">CP Gaete José Luis</p>
                  <p className="text-blue-300 text-xs">Contador Público · MP 15886</p>
                </div>
              </div>
              <a
                href={`https://wa.me/543416188165?text=${encodeURIComponent("Hola José Luis! Vi tu app Tu Negocio Ideal y me gustaría consultarte sobre el tema contable de mi emprendimiento 🙌")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-2.5 rounded-xl transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
            <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold">MG</div>
                <div>
                  <p className="font-semibold text-white text-sm">Maximiliano Gaete</p>
                  <p className="text-purple-300 text-xs">Marketing & Publicidad</p>
                </div>
              </div>
              <a
                href={`https://wa.me/543416610972?text=${encodeURIComponent("Hola Maximiliano! Vi tu app Tu Negocio Ideal y me gustaría consultarte sobre marketing para mi emprendimiento 🙌")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-2.5 rounded-xl transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="px-6 py-12 text-center">
          <div className="rounded-3xl p-8 max-w-lg mx-auto" style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <p className="text-2xl font-bold text-white mb-2">¿Listo para empezar?</p>
            <p className="text-slate-400 text-sm mb-6">Es gratis, tarda menos de 5 minutos y el plan es tuyo para siempre.</p>
            <button
              onClick={() => setFase("chat")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl text-base transition shadow-lg shadow-blue-500/30"
            >
              Empezar ahora →
            </button>
          </div>
          <p className="text-slate-600 text-xs mt-6">© 2026 Tu Negocio Ideal · Desarrollado para emprendedores argentinos</p>
        </section>

      </main>
    );
  }

  if (fase === "form") {
    return (
      <main className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800">Tu plan de emprendimiento</h1>
            <p className="text-slate-500 text-sm mt-1">Completá cada sección para armar tu plan completo</p>
          </div>

          {/* Datos editables */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-700">Tus datos</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Capital", key: "capital", placeholder: "$500.000" },
                { label: "Zona", key: "zona", placeholder: "Ciudad, País" },
                { label: "Intereses", key: "intereses", placeholder: "cocinar, redes..." },
                { label: "Horas por día", key: "horasDiarias", placeholder: "8" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-slate-500 font-medium">{f.label}</label>
                  <input
                    type="text"
                    value={datos[f.key as keyof DatosExtraidos]}
                    onChange={(e) =>
                      setDatos((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 font-medium">Local propio</label>
                <select
                  value={datos.localPropio}
                  onChange={(e) => setDatos((prev) => ({ ...prev, localPropio: e.target.value }))}
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition"
                >
                  <option value="no">No tengo</option>
                  <option value="si">Sí tengo</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium">Modalidad</label>
                <select
                  value={datos.modalidad}
                  onChange={(e) => setDatos((prev) => ({ ...prev, modalidad: e.target.value }))}
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition"
                >
                  <option value="solo">Solo</option>
                  <option value="socio">Con un socio</option>
                  <option value="equipo">Con equipo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ideas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-100 rounded-lg grid place-items-center text-blue-600 font-bold text-sm">1</div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Ideas de negocio</h2>
                <p className="text-xs text-slate-400">Personalizadas para tu perfil</p>
              </div>
            </div>
            <div className="px-6 py-5">
              {!ideasTexto ? (
                <button
                  onClick={async () => {
                    const res = await fetch("/api/ideas", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(datos),
                    });
                    const reader = res.body!.getReader();
                    const decoder = new TextDecoder();
                    let texto = "";
                    setIdeasTexto("...");
                    while (true) {
                      const { done, value } = await reader.read();
                      if (done) break;
                      texto += decoder.decode(value, { stream: true });
                      setIdeasTexto(texto);
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl transition"
                >
                  Generar ideas personalizadas ✨
                </button>
              ) : (
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ideasTexto}</p>
              )}
            </div>
          </div>

          {ideasTexto && ideasTexto !== "..." && (
            <IdeaSelector
              ideasTexto={ideasTexto}
              ideaElegida={ideaElegida}
              onElegir={setIdeaElegida}
            />
          )}

          {ideaElegida && (
            <>
              <PresupuestoInicial
                ideaElegida={ideaElegida}
                capital={datos.capital}
                zona={datos.zona}
                localPropio={datos.localPropio}
              />
              <LocalHabilitaciones
                intereses={ideaElegida}
                zona={datos.zona}
                localPropio={datos.localPropio}
              />
              <ProveedoresMarketing
                intereses={ideaElegida}
                zona={datos.zona}
              />
              <PlanAccion
                ideaElegida={ideaElegida}
                capital={datos.capital}
                zona={datos.zona}
                localPropio={datos.localPropio}
              />
              <CalculadoraPrecio ideaElegida={ideaElegida} zona={datos.zona} />
              <PuntoEquilibrio ideaElegida={ideaElegida} capital={datos.capital} />
              <ResumenFinal
                ideaElegida={ideaElegida}
                capital={datos.capital}
                zona={datos.zona}
                modalidad={datos.modalidad}
                horasDiarias={datos.horasDiarias}
              />
            </>
          )}

          <button
            onClick={() => setFase("landing")}
            className="text-sm text-slate-400 hover:text-slate-600 text-center transition"
          >
            ← Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-end sm:justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg flex flex-col h-screen sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-3xl sm:shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            N
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">Nico</h1>
            <p className="text-xs text-emerald-500 font-medium">Asesor de negocios · En línea</p>
          </div>
          <button
            onClick={irDirectoAlFormulario}
            className="ml-auto text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition"
          >
            Ir al formulario →
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {mensajes.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2 flex-shrink-0 mt-1">
                  N
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                {msg.content || <span className="opacity-40">...</span>}
              </div>
            </div>
          ))}

          {/* Botón cuando Nico termina */}
          {chatListo && (
            <div className="flex justify-center mt-2">
              <button
                onClick={irAlFormulario}
                disabled={extrayendo}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition flex items-center gap-2 animate-bounce"
              >
                {extrayendo ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Preparando tu plan...
                  </>
                ) : (
                  <>
                    Ver mi plan personalizado 🚀
                  </>
                )}
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t-2 border-slate-200 bg-white px-4 py-3">
          <div className="flex gap-2 items-end">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && enviarMensaje()}
              placeholder="Escribí tu mensaje..."
              disabled={enviando || chatListo}
              className="flex-1 bg-yellow-100 border-2 border-yellow-500 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-yellow-600 shadow-sm transition disabled:opacity-50"
            />
            <button
              onClick={enviarMensaje}
              disabled={!input.trim() || enviando || chatListo}
              className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center disabled:opacity-40 transition flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          {chatListo && (
            <p className="text-xs text-center text-emerald-600 font-medium mt-2">
              ¡Nico ya tiene todo! Tocá el botón de arriba para ver tu plan.
            </p>
          )}
        </div>

      </div>
    </main>
  );
}
