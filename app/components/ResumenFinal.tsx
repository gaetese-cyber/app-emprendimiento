"use client";


interface Props {
  ideaElegida: string;
  capital: string;
  zona: string;
  modalidad: string;
  horasDiarias: string;
}

const SECCIONES = [
  "Ideas de negocio personalizadas",
  "Presupuesto de arranque",
  "Local y habilitaciones",
  "Proveedores y cómo conseguir clientes",
  "Plan de acción semana a semana",
  "Calculadora de precio de venta",
  "Punto de equilibrio",
];

function formatCapital(raw: string): string {
  const n = parseFloat(raw.replace(/[^\d]/g, ""));
  if (isNaN(n) || n <= 0) return raw;
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default function ResumenFinal({ ideaElegida, capital, zona, modalidad, horasDiarias }: Props) {
  const modalidadLabel =
    modalidad === "solo" ? "Solo" : modalidad === "socio" ? "Con un socio" : "Con empleados";

  function guardarPDF() {
    window.print();
  }

  function compartirWhatsApp() {
    const texto =
      `*Mi plan de negocio*\n\n` +
      `*Idea elegida:* ${ideaElegida}\n` +
      `*Capital:* ${capital}\n` +
      `*Ciudad:* ${zona}\n` +
      `*Modalidad:* ${modalidadLabel}\n` +
      `*Horas por día:* ${horasDiarias}hs\n\n` +
      `Armado con Tu Negocio Ideal`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-blue-200 shadow-sm">
      {/* Header */}
      <div className="bg-blue-600 px-6 py-5">
        <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-1">
          Tu plan de negocio completo
        </p>
        <h2 className="text-xl font-bold text-white mb-1">{ideaElegida}</h2>
        <p className="text-sm text-blue-100">Todo listo para arrancar</p>
      </div>

      {/* Stats */}
      <div className="bg-blue-50 px-6 py-4 grid grid-cols-2 gap-3 border-b border-blue-100">
        {[
          { label: "Capital inicial", value: formatCapital(capital) },
          { label: "Ciudad", value: zona.split(",")[0] },
          { label: "Modalidad", value: modalidadLabel },
          { label: "Horas por día", value: `${horasDiarias} horas` },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-xs text-blue-400">{item.label}</p>
            <p className="text-sm font-semibold text-slate-700">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Checklist de secciones */}
      <div className="bg-white px-6 py-4 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Tu plan incluye
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SECCIONES.map((seccion) => (
            <div key={seccion} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-100 rounded-full grid place-items-center flex-shrink-0">
                <svg
                  className="w-2.5 h-2.5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs text-slate-600">{seccion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botones — se ocultan al imprimir */}
      <div className="bg-white px-6 pt-4 pb-2 print:hidden">
        <p className="text-xs text-slate-400 text-center mb-3">
          Presioná <kbd className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 font-mono text-xs">Ctrl+P</kbd> en el teclado para abrir el diálogo de impresión, luego elegí <strong className="text-slate-600">Guardar como PDF</strong>
        </p>
      </div>
      <div className="bg-white px-6 pb-4 flex gap-3 print:hidden">
        <button
          type="button"
          onClick={guardarPDF}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Guardar como PDF
        </button>
        <button
          onClick={compartirWhatsApp}
          className="bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Compartir
        </button>
      </div>
    </div>
  );
}
