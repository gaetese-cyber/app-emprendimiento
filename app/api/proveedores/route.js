import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

function extraerMarca(intereses) {
  const marcaMatch = intereses.match(/\b(?:marca|brand)\s+([A-Za-záéíóúñÁÉÍÓÚÑ0-9]+)/i);
  if (marcaMatch) return marcaMatch[1];
  const palabras = intereses.split(/\s+/);
  for (const p of palabras) {
    if (p.length > 3 && p === p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() && !/^(ropa|local|tienda|negocio|venta|ventas|para|adolescentes|jóvenes|jovenes|chicos|chicas|hombres|mujeres|niños|bebes)$/i.test(p)) {
      return p;
    }
  }
  return null;
}

async function fetchProveedoresML(intereses) {
  try {
    const marca = extraerMarca(intereses);
    const queries = [
      `${intereses} mayorista`,
      `${intereses} por mayor distribuidor`,
    ];
    if (marca) {
      queries.push(`${marca} mayorista Argentina`);
      queries.push(`${marca} distribuidora por mayor`);
    }
    const resultados = [];
    for (const q of queries) {
      const res = await fetch(
        `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(q)}&limit=8`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      for (const item of (data.results || []).slice(0, 5)) {
        if (item.price > 0) resultados.push({
          titulo: item.title,
          precio: item.price,
          moneda: item.currency_id,
          link: item.permalink,
        });
      }
    }
    const vistos = new Set();
    return resultados
      .filter((r) => { const k = r.titulo.slice(0, 35).toLowerCase(); if (vistos.has(k)) return false; vistos.add(k); return true; })
      .sort((a, b) => a.precio - b.precio)
      .slice(0, 8);
  } catch {
    return [];
  }
}

export async function POST(request) {
  try {
    const { zona, intereses } = await request.json();

    const marca = extraerMarca(intereses);
    const provML = await fetchProveedoresML(intereses);
    const provTexto = provML.length > 0
      ? `\nPROVEEDORES Y PRECIOS REALES EN MERCADOLIBRE (ordenados de más barato a más caro):\n` +
        provML.map((p) => `- ${p.titulo}: ${p.moneda === "USD" ? `USD ${p.precio}` : `$ ${p.precio.toLocaleString("es-AR")} ARS`}`).join("\n") +
        "\n"
      : "\n(No se encontraron resultados en MercadoLibre para este rubro)\n";

    const stream = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      stream: true,
      messages: [
        {
          role: "user",
          content: `Sos un asesor experto en negocios y comercio en Argentina (2026).
Una persona quiere abrir un negocio de: **${intereses}**
Zona: ${zona}

IMPORTANTE: Todo el contenido debe ser 100% específico para el rubro "${intereses}". No des información de otros rubros. Si el negocio es de celulares, hablá de proveedores de celulares. Si es de comida, hablá de insumos de comida. Nunca mezcles rubros.
${marca ? `\nESTE NEGOCIO MENCIONA UNA MARCA ESPECÍFICA: "${marca}". Esto es MUY IMPORTANTE. Debés buscar y mencionar:
- Quién distribuye oficialmente la marca "${marca}" en Argentina
- Si tiene distribuidores autorizados por zona o provincia
- Cómo contactar a la empresa o representante en Argentina para comprar al por mayor
- Si se consigue en ferias o mercados mayoristas de ropa (como La Salada, Flores, Once, etc.)
- Si tiene sitio web oficial, Instagram, o WhatsApp de ventas mayoristas
- Si no encontrás info directa de "${marca}", decilo honestamente y recomendá cómo buscarla (ej: buscar en Instagram "@${marca}oficial" o en Google "${marca} distribuidora Argentina")\n` : ""}

${provTexto}

## PARTE 1: PROVEEDORES DE ${intereses.toUpperCase()}

Explicá dónde conseguir los productos o insumos específicos para este rubro, ordenados de más barato a más caro:

### Opciones más económicas
- Mercados mayoristas y distribuidores físicos relevantes para **${intereses}** en Argentina. Para cada uno incluí:
  - Nombre del mercado o proveedor
  - Dirección o zona (sé específico: barrio, calle)
  - Sitio web o redes sociales si tienen
  - Teléfono de contacto si es conocido
  - Cómo comprar: si se necesita CUIT, días y horarios de atención

### Opciones intermedias
- Distribuidores y mayoristas de ${intereses} que entregan en el interior del país. Para cada uno incluí nombre, web/Instagram y cómo contactarlos.
- Ferias y exposiciones del rubro con fechas aproximadas si las conocés

### Opciones más caras pero más cómodas
- Plataformas online: MercadoLibre Mayoristas (mercadolibre.com.ar → filtro "Mayor cantidad"), Tiendamia (tiendamia.com), importadoras online
- Para cada plataforma explicá cómo comprar al por mayor en ella
- Ventajas y desventajas de online vs presencial

### Tips para negociar con proveedores
- Cómo pedir lista de precios mayoristas
- Importancia de pedir factura (protección legal y para descontar IVA)
- Cómo construir una relación a largo plazo

---

## PARTE 2: MARKETING Y CONSEGUIR CLIENTES

### Primeros clientes (sin presupuesto)
- Estrategias gratuitas para conseguir los primeros clientes
- El poder del boca a boca y cómo activarlo
- Grupos de WhatsApp del barrio, Facebook Marketplace, etc.

### Redes sociales para este rubro
- Cuál o cuáles redes son las más efectivas para este negocio específico
- Qué tipo de contenido publicar
- Con qué frecuencia publicar
- Cómo hacer buenos videos/fotos con el celular

### Publicidad paga con Meta Ads (Instagram y Facebook)
Explicá paso a paso cómo funciona Meta Ads para alguien que nunca lo usó:
- Cómo crear una cuenta en business.facebook.com
- Diferencia entre "impulsar publicación" (boost) y crear una campaña real desde el Administrador de Anuncios
- Cuánto invertir para empezar: en Argentina se puede arrancar con USD 3 a USD 5 por día (equivalente a $3.300 a $5.500 ARS aprox al tipo de cambio actual). Explicá que Meta cobra en dólares aunque la cuenta sea argentina.
- Cómo segmentar el público: por ciudad, edad, intereses
- Qué tipo de anuncio funciona mejor para este rubro (foto, video, carrusel)
- Cómo medir si el anuncio está funcionando (alcance, clics, costo por resultado)
- Cuándo escalar el presupuesto

### Google Ads y TikTok Ads
- Si aplica para este rubro y cuándo conviene usarlos

### La importancia del publicista / community manager
- Por qué es clave tener a alguien que maneje las redes profesionalmente
- Cuándo conviene contratar uno (no desde el día 1, sino cuando el negocio tenga algo de flujo)
- Costo aproximado de un community manager freelance en Argentina 2026: entre $150.000 y $500.000 ARS por mes según experiencia y cantidad de redes. Mencioná este rango explícitamente.
- Qué pedirle y cómo evaluarlo

Respondé en español argentino, de forma clara, práctica y motivadora. Usá títulos y listas.`,
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
