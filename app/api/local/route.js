import { getGroq } from "@/app/lib/groq-client";
import { LocalRequestSchema } from "@/app/lib/schemas";
import {
  checkRateLimit,
  getClientIp,
  rateLimitedResponse,
} from "@/app/lib/rate-limit";


async function fetchAlquileresML(zona) {
  try {
    const ciudad = zona.split(",")[0].trim();
    // MLA1459 = Inmuebles en MercadoLibre Argentina
    // Probamos dos queries para maximizar resultados
    const queries = [
      `https://api.mercadolibre.com/sites/MLA/search?category=MLA1459&q=${encodeURIComponent(`local alquiler ${ciudad}`)}&limit=10`,
      `https://api.mercadolibre.com/sites/MLA/search?category=MLA1459&q=${encodeURIComponent(`local comercial ${ciudad}`)}&limit=10`,
    ];

    const resultados = [];
    for (const url of queries) {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) continue;
      const data = await res.json();
      for (const item of (data.results || [])) {
        if (item.price > 0) resultados.push({
          titulo: item.title,
          precio: item.price,
          moneda: item.currency_id,
        });
      }
    }

    // Deduplicar y retornar los primeros 6
    const vistos = new Set();
    return resultados.filter((r) => {
      const key = r.titulo.slice(0, 40).toLowerCase();
      if (vistos.has(key)) return false;
      vistos.add(key);
      return true;
    }).slice(0, 6);
  } catch {
    return [];
  }
}

export async function POST(request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit("local", ip, 5, 60_000);
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const parsed = LocalRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const { zona, intereses, localPropio } = parsed.data;

    const alquileres = localPropio !== "si" ? await fetchAlquileresML(zona) : [];
    const alquileresTexto = alquileres.length > 0
      ? `\nPRECIOS REALES DE ALQUILER EN MERCADOLIBRE para "${zona.split(",")[0]}" (datos del día):\n` +
        alquileres.map((a) => `- ${a.titulo}: ${a.moneda === "USD" ? `USD ${a.precio.toLocaleString("es-AR")} (dólares)` : `$ ${a.precio.toLocaleString("es-AR")} ARS`}`).join("\n") +
        "\n\nIMPORTANTE: Los precios en USD son dólares estadounidenses. En Argentina los locales comerciales suelen publicarse en dólares. Al convertir a pesos argentinos usá un tipo de cambio realista (consultá el valor actual del dólar). Mostrá los precios en la moneda original y también el equivalente en pesos.\n"
      : "\n⚠️ NO SE ENCONTRARON PRECIOS REALES EN MERCADOLIBRE PARA ESTA ZONA. Por lo tanto, NO des estimaciones de costos de alquiler ya que no tenés datos reales. En cambio, indicale al usuario que use los links de Zonaprop, Argenprop y ML Inmuebles que aparecen en la sección de arriba para consultar los precios actuales en su zona antes de hacer cualquier cálculo.\n";

    const stream = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      stream: true,
      max_tokens: 1800,
      messages: [
        {
          role: "user",
          content: `Sos un asesor experto en negocios y trámites comerciales en Argentina (2026).
Una persona quiere abrir un negocio de: ${intereses}
Zona: ${zona}
¿Tiene local propio? ${localPropio === "si" ? "Sí" : "No"}

${alquileresTexto}

${localPropio !== "si" ? `
## BÚSQUEDA DE LOCAL

Explicá qué tipo de local necesita para este rubro (metros cuadrados mínimos, características clave, ubicación conveniente).

Basándote en los precios reales de MercadoLibre que te dimos arriba, estimá:
- Alquiler mensual probable
- Depósito (generalmente 1 a 3 meses)
- Mes de adelanto
- Honorarios de inmobiliaria (aproximadamente 1 mes + IVA, pero puede variar — recomendá consultarlo con la inmobiliaria)
- **Total aproximado para firmar el contrato**

Aclaraciones importantes sobre el contrato comercial en Argentina:
- Duración mínima legal: 3 años (Ley 27.551)
- Ajustes periódicos según índice ICL o el que acuerden
- Qué gastos paga el inquilino y cuáles el propietario
` : `
## PREPARACIÓN DEL LOCAL PROPIO
Qué necesita hacer para acondicionar el local para este rubro (reformas típicas, instalaciones necesarias, etc.).
`}

## HABILITACIONES Y TRÁMITES (paso a paso)

Hacé un checklist ordenado de los trámites necesarios para abrir este tipo de negocio en Argentina:

### Trámites en AFIP
- Alta como contribuyente: explicá si conviene monotributo o responsable inscripto para este rubro y nivel de ventas esperado
- Cómo obtener la clave fiscal si no la tiene
- Para los costos del monotributo: NO des números específicos, en cambio decile que consulte con un contador ya que las categorías cambian con frecuencia

### Ingresos Brutos (IIBB)
- Cómo inscribirse en la provincia de ${zona}
- Alícuota aproximada del rubro (si la conocés, sino recomendá consultarla en ARBA o el organismo provincial)

### Habilitación Municipal
- Pasos para habilitar el local en el municipio
- Documentación típica requerida (planos, inspección de bomberos, bromatología si aplica, etc.)
- Para los costos: indicá que varían mucho por municipio y que conviene consultar directamente en la municipalidad o con un gestor local

### Trámites específicos del rubro
- Habilitaciones especiales si aplican para este tipo de negocio

### ⚠️ Recordatorio muy importante
Terminá con un párrafo destacado recordando que todos estos trámites — especialmente el alta en AFIP, IIBB y la elección del régimen impositivo — **los debe gestionar un contador de confianza**. Un contador no solo evita errores costosos, sino que elige el régimen más conveniente, lleva los libros en regla y puede ahorrarle mucho dinero a largo plazo. Los honorarios del contador son una inversión, no un gasto.

Respondé en español argentino, de forma clara, organizada y motivadora. Usá títulos y listas para que sea fácil de leer.`,
        },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
