import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function fetchPreciosML(intereses) {
  try {
    const busquedas = [
      `${intereses} mayorista`,
      `${intereses} al por mayor`,
    ];

    const resultados = [];

    for (const q of busquedas) {
      const res = await fetch(
        `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(q)}&limit=5`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (data.results) {
        for (const item of data.results.slice(0, 5)) {
          resultados.push({
            titulo: item.title,
            precio: item.price,
            condicion: item.condition === "new" ? "nuevo" : "usado",
            link: item.permalink,
          });
        }
      }
    }

    // deduplicar por título aproximado
    const vistos = new Set();
    return resultados.filter((r) => {
      const key = r.titulo.slice(0, 30).toLowerCase();
      if (vistos.has(key)) return false;
      vistos.add(key);
      return true;
    }).slice(0, 8);
  } catch {
    return [];
  }
}

export async function POST(request) {
  try {
    const { capital, zona, intereses, localPropio, modalidad, horasDiarias } = await request.json();

    const modalidadTexto =
      modalidad === "solo" ? "trabaja solo" :
      modalidad === "socio" ? "tiene un socio" :
      "tiene un equipo";

    const preciosML = await fetchPreciosML(intereses);
    const preciosTexto = preciosML.length > 0
      ? `\nPRECIOS REALES HOY EN MERCADOLIBRE (búsqueda: "${intereses} mayorista / al por mayor"):\n` +
        preciosML.map((p) => `- ${p.titulo}: $${p.precio.toLocaleString("es-AR")} (${p.condicion})`).join("\n") +
        "\n\nUsá estos precios como referencia real para estimar los costos de inversión. Si hay precios de mayoristas, priorizalos para calcular el stock inicial.\n"
      : "\n(No se encontraron precios en MercadoLibre para este rubro, usá tus conocimientos del mercado argentino 2026)\n";

    const stream = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      stream: true,
      messages: [
        {
          role: "user",
          content: `Sos un asesor de negocios con amplia experiencia en el mercado argentino actual (2026). Conocés muy bien los precios reales del mercado, la inflación y el costo de vida en Argentina.

Una persona quiere emprender. Sus datos son:
- Capital disponible: ${capital}
- Zona: ${zona}
- Intereses o habilidades: ${intereses}
- Local propio: ${localPropio === "si" ? "Sí tiene local propio" : "No tiene local propio"}
- Modalidad: ${modalidadTexto}
- Horas disponibles por día: ${horasDiarias} horas

REGLAS IMPORTANTES SOBRE LOS COSTOS (Argentina 2026):
- Los valores deben ser REALISTAS. Mencioná siempre de dónde vienen los números (ej: "precio de mayorista en La Salada", "alquiler promedio en zona comercial", "precio minorista de celulares en Mercado Libre", etc.)
- Ropa/indumentaria: stock inicial mínimo $800.000 a $2.000.000 ARS (comprando en mayoristas como La Salada o distribuidores)
- Celulares: un solo equipo de gama media vale entre $300.000 y $800.000 ARS; stock mínimo viable $3.000.000 a $8.000.000 ARS
- Autos usados: un auto usado básico parte de $8.000.000 a $15.000.000 ARS; para una pequeña agencia se necesita al menos $30.000.000 a $50.000.000 ARS en stock
- Alquiler local comercial ciudad mediana: $200.000 a $600.000 ARS/mes; en CABA o zonas premium puede triplicarse
- Habilitación municipal + inicio: $300.000 a $800.000 ARS según ciudad y rubro
- Si el capital NO es suficiente para una idea, decilo con claridad y ofrecé una alternativa viable con ese capital
- Nunca inventes números sin base real; si no tenés el dato exacto, dá un rango razonable y explicá en qué te basás
${preciosTexto}

Dame 3 ideas de negocios concretas y viables considerando el capital real disponible. Para cada idea incluí:
1. **Nombre del negocio**
2. **Descripción** (2 oraciones)
3. **Inversión inicial estimada** con desglose (stock, local/equipamiento, habilitaciones, capital de trabajo) y de dónde vienen esos números
4. **¿Es viable con el capital disponible?** Sé honesto y directo
5. **Por qué es una buena oportunidad para esta persona**

Respondé en español argentino, de forma clara, realista y motivadora.`,
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
