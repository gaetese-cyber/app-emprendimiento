"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare,
  ClipboardList,
  FileText,
  Lightbulb,
  Wallet,
  Store,
  Package,
  Megaphone,
  Calendar,
  RotateCcw,
  Send,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Calculator,
} from "lucide-react";
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

const MAX_PREGUNTAS = 3;
const STORAGE_KEY = "tni_chat_v3";
const FIN_MARKER = "[FIN_CHAT]";

const MENSAJE_INICIAL: Mensaje = {
  role: "assistant",
  content:
    "¡Hola! Soy Nico 👋, el asistente virtual del estudio del CP Gaete José Luis.\n\nTe voy a hacer 3 preguntas cortas para armarte una orientación inicial sobre tu emprendimiento. Después podés ver el plan y, si querés profundizar de verdad, te paso con José Luis.\n\nPara arrancar: ¿en qué ciudad vivís y cuánto capital tenés disponible para invertir?",
};

function stripFinMarker(text: string): string {
  return text.replace(FIN_MARKER, "").trim();
}

export default function Home() {
  const [fase, setFase] = useState<"landing" | "chat" | "form">("landing");
  const [mensajes, setMensajes] = useState<Mensaje[]>([MENSAJE_INICIAL]);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [chatListo, setChatListo] = useState(false);
  const [extrayendo, setExtrayendo] = useState(false);
  const [errorChat, setErrorChat] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
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
  const restoredRef = useRef(false);

  // Restaurar del sessionStorage al montar (una sola vez)
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        mensajes?: Mensaje[];
        chatListo?: boolean;
      };
      if (parsed.mensajes && parsed.mensajes.length > 0) {
        setMensajes(parsed.mensajes);
        if (parsed.chatListo) setChatListo(true);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  // Persistir en sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mensajes, chatListo }),
      );
    } catch {
      // ignore quota errors
    }
  }, [mensajes, chatListo]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes, chatListo]);

  const turnosUsuario = mensajes.filter((m) => m.role === "user").length;
  const restantes = Math.max(0, MAX_PREGUNTAS - turnosUsuario);

  const enviarMensaje = useCallback(async () => {
    if (!input.trim() || enviando || chatListo) return;
    setErrorChat(null);

    const nuevosMensajes: Mensaje[] = [
      ...mensajes,
      { role: "user", content: input.trim().slice(0, 500) },
    ];
    setMensajes(nuevosMensajes);
    setInput("");
    setEnviando(true);

    try {
      const respuesta = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nuevosMensajes }),
      });

      if (!respuesta.ok) {
        if (respuesta.status === 429) {
          setErrorChat("Estás escribiendo muy rápido. Esperá unos segundos.");
        } else if (respuesta.status === 400) {
          setErrorChat("Mensaje inválido. Probá con uno más corto.");
        } else {
          setErrorChat("No pude responder en este momento. Reintentá.");
        }
        setMensajes((prev) => prev.slice(0, -1)); // rollback del user msg
        setEnviando(false);
        return;
      }

      const cerrado = respuesta.headers.get("X-Chat-Closed") === "true";
      const reader = respuesta.body!.getReader();
      const decoder = new TextDecoder();
      let texto = "";

      setMensajes((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        texto += decoder.decode(value, { stream: true });
        const visible = stripFinMarker(texto);
        setMensajes((prev) => {
          const copia = [...prev];
          copia[copia.length - 1] = { role: "assistant", content: visible };
          return copia;
        });
      }

      setEnviando(false);
      if (cerrado || texto.includes(FIN_MARKER)) {
        setChatListo(true);
      }
    } catch {
      setErrorChat("No pude conectarme. Verificá tu conexión y reintentá.");
      setMensajes((prev) => prev.slice(0, -1));
      setEnviando(false);
    }
  }, [input, enviando, chatListo, mensajes]);

  const reiniciarChat = useCallback(() => {
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    setMensajes([MENSAJE_INICIAL]);
    setChatListo(false);
    setInput("");
    setErrorChat(null);
    setConfirmReset(false);
    if (typeof window !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
  }, [confirmReset]);

  async function irAlFormulario() {
    setExtrayendo(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: mensajes }),
      });
      const extraido = res.ok ? await res.json() : {};
      setDatos({
        capital: extraido.capital || "",
        zona: extraido.zona || "",
        intereses: extraido.intereses || "",
        localPropio: extraido.localPropio || "no",
        modalidad: extraido.modalidad || "solo",
        horasDiarias: extraido.horasDiarias || "8",
      });
    } catch {
      // datos quedan en defaults; el usuario puede editarlos manualmente
    } finally {
      setExtrayendo(false);
      setFase("form");
    }
  }

  function irDirectoAlFormulario() {
    setFase("form");
  }

  if (fase === "landing") {
    return <Landing onChat={() => setFase("chat")} onForm={() => setFase("form")} />;
  }

  if (fase === "form") {
    return (
      <FormView
        datos={datos}
        setDatos={setDatos}
        ideasTexto={ideasTexto}
        setIdeasTexto={setIdeasTexto}
        ideaElegida={ideaElegida}
        setIdeaElegida={setIdeaElegida}
        onVolver={() => setFase("landing")}
      />
    );
  }

  return (
    <main className="min-h-dvh paper-bg flex flex-col items-center justify-end sm:justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg flex flex-col h-dvh sm:h-auto sm:max-h-[90vh] bg-bone sm:rounded-xl sm:shadow-[0_8px_30px_rgba(26,58,82,0.12)] sm:border sm:border-[var(--color-border)] overflow-hidden">
        {/* Header */}
        <div className="bg-bone border-b border-[var(--color-border)] px-3 py-3 flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setFase("landing")}
            title="Volver al inicio"
            aria-label="Volver al inicio"
            className="w-9 h-9 -ml-1 rounded-md text-muted hover:bg-cream hover:text-navy transition flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-md bg-navy flex items-center justify-center text-cream font-serif font-semibold text-base flex-shrink-0">
            N
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif font-semibold text-ink text-base leading-tight truncate">
              Nico · Asistente del estudio
            </h1>
            <p className="text-xs text-muted truncate">
              {chatListo
                ? "Conversación finalizada"
                : `Pregunta ${Math.min(turnosUsuario + 1, MAX_PREGUNTAS)} de ${MAX_PREGUNTAS} · Quedan ${restantes}`}
            </p>
          </div>
          <button
            onClick={reiniciarChat}
            title={confirmReset ? "Tocá de nuevo para confirmar" : "Reiniciar conversación"}
            aria-label="Reiniciar conversación"
            className={`text-xs font-medium rounded-md px-2.5 py-1.5 transition flex items-center gap-1.5 flex-shrink-0 border ${
              confirmReset
                ? "border-earth text-earth bg-earth/10"
                : "border-[var(--color-border)] text-muted hover:bg-cream hover:text-navy"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {confirmReset ? "¿Reiniciar?" : "Reiniciar"}
            </span>
            <span className="inline sm:hidden">
              {confirmReset ? "¿?" : ""}
            </span>
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
                <div className="w-7 h-7 rounded-md bg-navy flex items-center justify-center text-cream font-serif font-semibold text-[11px] mr-2 flex-shrink-0 mt-0.5">
                  N
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-2.5 text-[0.9375rem] leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-navy text-cream rounded-2xl rounded-br-sm"
                    : "bg-cream text-ink rounded-2xl rounded-bl-sm border border-[var(--color-border)]"
                }`}
              >
                {msg.content || <span className="opacity-40">...</span>}
              </div>
            </div>
          ))}

          {chatListo && (
            <div className="flex flex-col items-stretch gap-3 mt-2">
              <button
                onClick={irAlFormulario}
                disabled={extrayendo}
                className="bg-bottle hover:bg-bottle-dark text-cream font-semibold px-5 py-3 rounded-lg shadow-sm transition flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {extrayendo ? (
                  <>
                    <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                    Preparando tu plan…
                  </>
                ) : (
                  <>
                    Ver mi plan orientativo
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <div className="rounded-lg border border-[var(--color-border)] bg-cream/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-earth mb-2">
                  ¿Querés profundizar con un contador?
                </p>
                <p className="text-sm text-ink leading-relaxed mb-3">
                  El plan que sigue es orientativo. Para asesoramiento contable
                  formal hablá con José Luis.
                </p>
                <a
                  href={`https://wa.me/543416188165?text=${encodeURIComponent(
                    "Hola José Luis! Usé el asistente del estudio y me gustaría consultarte sobre mi emprendimiento.",
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-bottle hover:text-bottle-dark transition"
                >
                  CP Gaete José Luis · MP 15886 →
                </a>
              </div>
            </div>
          )}

          {errorChat && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-800 text-sm px-3 py-2">
              {errorChat}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-[var(--color-border)] bg-bone px-3 py-3">
          <div className="flex gap-2 items-end">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && enviarMensaje()
              }
              placeholder={
                chatListo
                  ? "Conversación finalizada"
                  : "Escribí tu respuesta…"
              }
              disabled={enviando || chatListo}
              maxLength={500}
              className="flex-1 bg-bone border border-[var(--color-border)] rounded-lg px-4 py-3 text-[0.9375rem] text-ink placeholder:text-muted/60 focus:outline-none focus:border-bottle focus:ring-2 focus:ring-bottle/15 transition disabled:opacity-50"
            />
            <button
              onClick={enviarMensaje}
              disabled={!input.trim() || enviando || chatListo}
              aria-label="Enviar"
              className="w-11 h-11 bg-navy hover:bg-navy-dark text-cream rounded-lg flex items-center justify-center disabled:opacity-40 transition flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-muted/80 mt-2 px-1">
            Información orientativa · No constituye asesoramiento contable formal
          </p>
        </div>
      </div>
    </main>
  );
}

/* ---------- LANDING ---------- */

function Landing({ onChat, onForm }: { onChat: () => void; onForm: () => void }) {
  const pasos = [
    {
      n: "1",
      Icon: MessageSquare,
      title: "Contanos tu situación",
      desc: "Tres preguntas breves sobre tu capital, zona e intereses.",
    },
    {
      n: "2",
      Icon: Sparkles,
      title: "Recibís una orientación",
      desc: "Generamos ideas, presupuesto y trámites según tu perfil.",
    },
    {
      n: "3",
      Icon: FileText,
      title: "Descargás el plan",
      desc: "Lo guardás en PDF y, si querés, lo revisás con el contador.",
    },
  ];

  const incluye = [
    { Icon: Lightbulb, title: "Ideas de negocio", desc: "Adaptadas a tu capital" },
    { Icon: Wallet, title: "Presupuesto inicial", desc: "Costos de referencia 2026" },
    { Icon: Store, title: "Local y habilitaciones", desc: "Trámites y permisos" },
    { Icon: Package, title: "Proveedores", desc: "Dónde comprar más barato" },
    { Icon: Megaphone, title: "Marketing", desc: "Primeros clientes" },
    { Icon: Calendar, title: "Plan semanal", desc: "Tareas concretas para arrancar" },
  ];

  return (
    <main className="min-h-dvh paper-bg text-ink overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-cream/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-navy" strokeWidth={1.5} />
            <span className="font-serif font-semibold text-navy text-base">
              Tu Negocio Ideal
            </span>
            <span className="hidden sm:inline text-xs text-muted ml-2">
              · Estudio CP Gaete
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/contador"
              className="text-xs font-semibold text-bottle hover:text-bottle-dark transition border border-bottle/30 px-3 py-1.5 rounded-lg hover:bg-bottle/5"
            >
              Panel Contador →
            </a>
            <a
              href="#contacto"
              className="text-xs font-medium text-muted hover:text-navy transition"
            >
              Contacto
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="px-6 pt-14 pb-12 max-w-3xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-earth mb-5">
          Asesoría contable · Argentina 2026
        </p>
        <h1 className="font-serif text-[2.3rem] sm:text-5xl font-semibold leading-[1.1] text-navy mb-5 tracking-tight">
          Orientación inicial para
          <br />
          tu próximo emprendimiento
        </h1>
        <p className="text-muted text-base sm:text-lg max-w-xl mx-auto mb-9 leading-relaxed">
          Respondé tres preguntas breves y recibí un plan con ideas, presupuesto
          y trámites — preparado a partir del criterio de un contador
          matriculado.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <button
            onClick={onChat}
            className="flex-1 bg-navy hover:bg-navy-dark text-cream font-semibold py-3.5 rounded-lg text-sm transition shadow-sm flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" strokeWidth={2} />
            Comenzar la consulta
          </button>
          <button
            onClick={onForm}
            className="flex-1 border border-navy/30 text-navy font-semibold py-3.5 rounded-lg text-sm hover:bg-navy/5 transition flex items-center justify-center gap-2"
          >
            <ClipboardList className="w-4 h-4" strokeWidth={2} />
            Ir al formulario
          </button>
        </div>
        <p className="text-xs text-muted/80 mt-5">
          Gratis · Sin registro · Información orientativa
        </p>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="px-6 py-10 max-w-4xl mx-auto">
        <h2 className="font-serif text-2xl font-semibold text-navy mb-2 text-center tracking-tight">
          Cómo funciona
        </h2>
        <p className="text-center text-muted text-sm mb-10">
          Tres pasos breves. Sin promesas vacías.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {pasos.map(({ n, Icon, title, desc }) => (
            <div
              key={n}
              className="rounded-lg p-5 bg-bone border border-[var(--color-border)] flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-serif text-2xl font-semibold text-earth leading-none">
                  {n}
                </span>
                <Icon className="w-5 h-5 text-bottle" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-semibold text-navy text-base">
                {title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUÉ INCLUYE */}
      <section className="px-6 py-10 max-w-4xl mx-auto">
        <h2 className="font-serif text-2xl font-semibold text-navy mb-2 text-center tracking-tight">
          Qué incluye tu plan
        </h2>
        <p className="text-center text-muted text-sm mb-10">
          Material concreto, no genérico.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {incluye.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-lg p-4 bg-bone border border-[var(--color-border)] transition hover:border-navy/30"
            >
              <Icon className="w-5 h-5 text-bottle mb-2.5" strokeWidth={1.5} />
              <h3 className="font-serif font-semibold text-navy text-sm mb-1">
                {title}
              </h3>
              <p className="text-muted text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PANEL CONTADOR */}
      <section className="px-6 py-10 max-w-4xl mx-auto">
        <div className="rounded-xl p-8 flex flex-col sm:flex-row items-center gap-6 border" style={{ background: "var(--color-navy)", borderColor: "var(--color-navy-dark)" }}>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-300 mb-2">
              Para profesionales
            </p>
            <h2 className="font-serif text-2xl font-semibold text-white mb-2">
              ¿Sos contador/a?
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              Accedé al panel profesional con módulos de clientes, facturación AFIP, liquidación de sueldos, contabilidad, peritos y constitución de sociedades.
            </p>
          </div>
          <a
            href="/contador"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: "white", color: "var(--color-navy)" }}
          >
            Abrir panel
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* PROFESIONALES */}
      <section id="contacto" className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="font-serif text-2xl font-semibold text-navy mb-2 text-center tracking-tight">
          Respaldo profesional
        </h2>
        <p className="text-center text-muted text-sm mb-10">
          ¿Querés profundizar? Contactá directamente a los profesionales.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ContactCard
            initials="JL"
            name="CP Gaete José Luis"
            role="Contador Público · MP 15886"
            note="Constitución, monotributo, IIBB, libros y cierre de balance."
            wa="543416188165"
            msg="Hola José Luis! Vi la app del estudio y me gustaría consultarte sobre mi emprendimiento."
          />
          <ContactCard
            initials="MG"
            name="Maximiliano Gaete"
            role="Marketing & Publicidad"
            note="Estrategia de redes, contenidos y campañas pagas."
            wa="543416610972"
            msg="Hola Maximiliano! Vi la app del estudio y me gustaría consultarte sobre marketing."
          />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 py-12 text-center">
        <div className="rounded-xl p-8 max-w-lg mx-auto bg-bone border border-[var(--color-border)]">
          <ShieldCheck
            className="w-7 h-7 text-bottle mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="font-serif text-2xl font-semibold text-navy mb-2">
            ¿Listo para empezar?
          </p>
          <p className="text-muted text-sm mb-6">
            Tarda menos de cinco minutos. El plan queda guardado para vos.
          </p>
          <button
            onClick={onChat}
            className="w-full bg-navy hover:bg-navy-dark text-cream font-semibold py-3.5 rounded-lg text-sm transition shadow-sm flex items-center justify-center gap-2"
          >
            Comenzar la consulta
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--color-border)] bg-cream/60">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center">
          <p className="text-xs text-muted leading-relaxed">
            Información orientativa generada por un asistente automatizado. No
            constituye asesoramiento contable formal. Para tu situación
            particular consultá con CP Gaete José Luis (MP 15886).
          </p>
          <p className="text-xs text-muted/70 mt-2">
            © 2026 Tu Negocio Ideal · Estudio CP Gaete
          </p>
        </div>
      </footer>
    </main>
  );
}

function ContactCard({
  initials,
  name,
  role,
  note,
  wa,
  msg,
}: {
  initials: string;
  name: string;
  role: string;
  note: string;
  wa: string;
  msg: string;
}) {
  return (
    <div className="rounded-lg p-5 bg-bone border border-[var(--color-border)] flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-md bg-navy text-cream font-serif font-semibold text-lg flex items-center justify-center">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-serif font-semibold text-navy text-base leading-tight">
            {name}
          </p>
          <p className="text-xs text-earth font-medium mt-0.5">{role}</p>
        </div>
      </div>
      <p className="text-sm text-muted leading-relaxed">{note}</p>
      <a
        href={`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 bg-bottle hover:bg-bottle-dark text-cream font-semibold text-sm py-2.5 rounded-md transition"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Hablar por WhatsApp
      </a>
    </div>
  );
}

/* ---------- FORM ---------- */

function FormView({
  datos,
  setDatos,
  ideasTexto,
  setIdeasTexto,
  ideaElegida,
  setIdeaElegida,
  onVolver,
}: {
  datos: DatosExtraidos;
  setDatos: React.Dispatch<React.SetStateAction<DatosExtraidos>>;
  ideasTexto: string;
  setIdeasTexto: React.Dispatch<React.SetStateAction<string>>;
  ideaElegida: string;
  setIdeaElegida: React.Dispatch<React.SetStateAction<string>>;
  onVolver: () => void;
}) {
  return (
    <main className="min-h-dvh paper-bg py-8 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-5">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-earth mb-2">
            Plan orientativo
          </p>
          <h1 className="font-serif text-3xl font-semibold text-navy tracking-tight">
            Tu plan de emprendimiento
          </h1>
          <p className="text-muted text-sm mt-2">
            Completá cada sección. Los números son referencias, no compromisos.
          </p>
        </div>

        {/* Datos editables */}
        <div className="bg-bone rounded-lg border border-[var(--color-border)] shadow-sm p-5 flex flex-col gap-3">
          <h2 className="font-serif text-base font-semibold text-navy">Tus datos</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Capital", key: "capital", placeholder: "$500.000" },
              { label: "Zona", key: "zona", placeholder: "Ciudad, País" },
              { label: "Intereses", key: "intereses", placeholder: "cocina, redes…" },
              { label: "Horas por día", key: "horasDiarias", placeholder: "8" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs text-muted font-medium">
                  {f.label}
                </label>
                <input
                  type="text"
                  value={datos[f.key as keyof DatosExtraidos]}
                  onChange={(e) =>
                    setDatos((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  placeholder={f.placeholder}
                  className="w-full mt-1 border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-ink bg-cream/40 focus:outline-none focus:ring-2 focus:ring-bottle/20 focus:border-bottle transition"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted font-medium">Local propio</label>
              <select
                value={datos.localPropio}
                onChange={(e) =>
                  setDatos((prev) => ({ ...prev, localPropio: e.target.value }))
                }
                className="w-full mt-1 border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-ink bg-cream/40 focus:outline-none focus:ring-2 focus:ring-bottle/20 focus:border-bottle transition"
              >
                <option value="no">No tengo</option>
                <option value="si">Sí tengo</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted font-medium">Modalidad</label>
              <select
                value={datos.modalidad}
                onChange={(e) =>
                  setDatos((prev) => ({ ...prev, modalidad: e.target.value }))
                }
                className="w-full mt-1 border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-ink bg-cream/40 focus:outline-none focus:ring-2 focus:ring-bottle/20 focus:border-bottle transition"
              >
                <option value="solo">Solo</option>
                <option value="socio">Con un socio</option>
                <option value="equipo">Con equipo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ideas */}
        <div className="bg-bone rounded-lg border border-[var(--color-border)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-3">
            <span className="font-serif text-xl font-semibold text-earth leading-none">
              1
            </span>
            <div>
              <h2 className="font-serif text-base font-semibold text-navy">
                Ideas de negocio
              </h2>
              <p className="text-xs text-muted">Adaptadas a tu perfil</p>
            </div>
          </div>
          <div className="px-6 py-5">
            {!ideasTexto ? (
              <button
                onClick={async () => {
                  setIdeasTexto("...");
                  try {
                    const res = await fetch("/api/ideas", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(datos),
                    });
                    if (!res.ok) {
                      setIdeasTexto("");
                      return;
                    }
                    const reader = res.body!.getReader();
                    const decoder = new TextDecoder();
                    let texto = "";
                    while (true) {
                      const { done, value } = await reader.read();
                      if (done) break;
                      texto += decoder.decode(value, { stream: true });
                      setIdeasTexto(texto);
                    }
                  } catch {
                    setIdeasTexto("");
                  }
                }}
                className="w-full bg-navy hover:bg-navy-dark text-cream font-semibold text-sm py-3 rounded-md transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                Generar ideas
              </button>
            ) : (
              <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
                {ideasTexto}
              </p>
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
            <ProveedoresMarketing intereses={ideaElegida} zona={datos.zona} />
            <PlanAccion
              ideaElegida={ideaElegida}
              capital={datos.capital}
              zona={datos.zona}
              localPropio={datos.localPropio}
            />
            <CalculadoraPrecio />
            <PuntoEquilibrio />
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
          onClick={onVolver}
          className="text-sm text-muted hover:text-navy text-center transition"
        >
          ← Volver al inicio
        </button>

        <p className="text-[11px] text-muted/70 text-center px-4 leading-relaxed">
          Plan generado por un asistente automatizado. Información orientativa.
          Para asesoramiento contable formal consultá con CP Gaete José Luis
          (MP 15886).
        </p>
      </div>
    </main>
  );
}
