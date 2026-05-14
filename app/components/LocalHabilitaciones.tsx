"use client";

import { useState } from "react";
import { marked } from "marked";

marked.setOptions({ breaks: true });

interface Props {
  zona: string;
  intereses: string;
  localPropio: string;
}

function normalizarCiudad(zona: string): string {
  const ciudad = zona.split(",")[0].trim();
  // Caso especial para CABA
  if (/buenos aires.*caba|caba|capital federal/i.test(ciudad)) return "capital-federal";
  return ciudad
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-");
}

function buildLinks(zona: string) {
  const ciudadNorm = normalizarCiudad(zona);
  const ciudadRaw = zona.split(",")[0].trim();
  return [
    {
      nombre: "Zonaprop",
      url: `https://www.zonaprop.com.ar/locales-comerciales-alquiler-${ciudadNorm}.html`,
      color: "bg-navy",
      icon: "🏠",
    },
    {
      nombre: "Argenprop",
      url: `https://www.argenprop.com/local-en-alquiler?q=${encodeURIComponent(ciudadRaw)}`,
      color: "bg-earth",
      icon: "🏢",
    },
    {
      nombre: "ML Inmuebles",
      url: `https://inmuebles.mercadolibre.com.ar/alquiler/local-comercial/${ciudadNorm}/`,
      color: "bg-earth",
      icon: "🔑",
    },
  ];
}

export default function LocalHabilitaciones({ zona, intereses, localPropio }: Props) {
  const [contenido, setContenido] = useState("");
  const [cargando, setCargando] = useState(false);
  const [generado, setGenerado] = useState(false);

  async function generar() {
    setCargando(true);
    setContenido("");
    try {
      const res = await fetch("/api/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zona, intereses, localPropio }),
      });

      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setContenido((prev) => prev + decoder.decode(value, { stream: true }));
      }

      setGenerado(true);
    } catch {
      setContenido("No se pudo generar la información. Intentá de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  const links = buildLinks(zona);

  return (
    <div className="bg-bone rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-earth/10 rounded-lg grid place-items-center">
          <svg className="w-4 h-4 text-earth" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            {localPropio === "si" ? "Tu local y habilitaciones" : "Buscar local y habilitaciones"}
          </h2>
          <p className="text-xs text-slate-400">
            {localPropio === "si"
              ? "Cómo acondicionar tu espacio + los papeles para abrir legalmente (AFIP, municipio)"
              : "Locales disponibles en tu zona + los papeles para abrir legalmente (AFIP, municipio)"}
          </p>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-4">
        {/* Links inmobiliarias - solo si no tiene local */}
        {localPropio !== "si" && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Buscar locales en {zona.split(",")[0]}</p>
            <div className="flex gap-2 flex-wrap">
              {links.map((link) => (
                <a
                  key={link.nombre}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 ${link.color} text-cream text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition`}
                >
                  <span>{link.icon}</span>
                  {link.nombre}
                  <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Estos links te llevan directo a locales en alquiler en tu zona.
            </p>
          </div>
        )}

        {/* Botón generar */}
        {!generado && (
          <button
            onClick={generar}
            disabled={cargando}
            className="bg-earth hover:bg-earth text-cream text-sm font-semibold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generando información…
              </>
            ) : (
              <>
                {localPropio === "si" ? "Ver trámites y habilitaciones" : "Ver costos estimados y trámites"}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        )}

        {/* Contenido generado */}
        {(contenido || cargando) && (
          <div>
            {generado && (
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-bottle" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Información generada</span>
              </div>
            )}
            <div
              className="markdown"
              dangerouslySetInnerHTML={{ __html: marked(contenido) as string }}
            />
            {cargando && contenido && (
              <span className="inline-block w-0.5 h-4 bg-earth animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
