"use client";

interface Props {
  ideasTexto: string;
  ideaElegida: string;
  onElegir: (idea: string) => void;
}

function extraerNombres(texto: string): string[] {
  // Busca patrones como **Idea 1: "Nombre"** o **Idea 1: Nombre**
  const matches = Array.from(
    texto.matchAll(/\*\*Idea\s+\d+[:\s]+["""«]?([^"""«»*\n]{3,60})["""»]?\*\*/gi)
  );
  if (matches.length >= 3) {
    return matches.slice(0, 3).map((m) => m[1].trim());
  }
  // Fallback: buscar líneas que empiecen con "Idea N"
  const lineas = texto.match(/^#+\s*Idea\s+\d+[:\s]+(.+)$/gim);
  if (lineas && lineas.length >= 3) {
    return lineas.slice(0, 3).map((l) => l.replace(/^#+\s*Idea\s+\d+[:\s]+/i, "").trim());
  }
  return ["Idea 1", "Idea 2", "Idea 3"];
}

const COLORES = [
  { bg: "bg-navy/5", border: "border-navy/25", active: "bg-navy", text: "text-navy", num: "bg-navy/10 text-navy" },
  { bg: "bg-earth/5", border: "border-earth/25", active: "bg-earth", text: "text-earth", num: "bg-earth/10 text-earth" },
  { bg: "bg-bottle/5", border: "border-bottle/25", active: "bg-bottle", text: "text-bottle", num: "bg-bottle/10 text-bottle" },
];

export default function IdeaSelector({ ideasTexto, ideaElegida, onElegir }: Props) {
  const nombres = extraerNombres(ideasTexto);

  return (
    <div className="bg-bone rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-navy/10 rounded-lg grid place-items-center">
          <svg className="w-4 h-4 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">¿Con cuál idea te quedás?</h2>
          <p className="text-xs text-slate-400">Tocá la que más te llama la atención — todo el plan se arma para esa</p>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-4">
        {nombres.map((nombre, i) => {
          const c = COLORES[i];
          const elegida = ideaElegida === nombre;
          return (
            <button
              key={i}
              onClick={() => onElegir(elegida ? "" : nombre)}
              className={`flex flex-col gap-1 px-5 py-4 rounded-xl border-2 text-left transition ${
                elegida
                  ? `${c.active} border-transparent text-cream`
                  : `${c.bg} ${c.border}`
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-widest ${elegida ? "text-cream opacity-80" : c.text}`}>
                  Idea {i + 1}
                </span>
                {elegida && (
                  <svg className="w-5 h-5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-base font-bold leading-snug ${elegida ? "text-cream" : c.text}`}>
                {nombre}
              </span>
            </button>
          );
        })}

        {ideaElegida && (
          <p className="text-xs text-center text-slate-400 mt-1">
            Las secciones de abajo están personalizadas para <span className="font-semibold text-slate-600">{ideaElegida}</span>
          </p>
        )}
      </div>
    </div>
  );
}
