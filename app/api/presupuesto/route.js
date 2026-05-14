import { getGroq } from "@/app/lib/groq-client";
import { PresupuestoRequestSchema } from "@/app/lib/schemas";
import {
  checkRateLimit,
  getClientIp,
  rateLimitedResponse,
} from "@/app/lib/rate-limit";


export async function POST(request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit("presupuesto", ip, 5, 60_000);
  if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  const parsed = PresupuestoRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const { ideaElegida, capital, zona, localPropio } = parsed.data;

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: `Sos un asesor financiero experto en emprendimientos en Argentina (2026).

Una persona quiere abrir: ${ideaElegida}
Zona: ${zona}
Capital disponible: ${capital}
Tiene local propio: ${localPropio === "si" ? "Sí" : "No"}

Armá un presupuesto inicial detallado con todos los costos para abrir este negocio en Argentina en 2026.

Respondé SOLO con un JSON válido con este formato exacto (sin texto extra):
{
  "items": [
    {
      "categoria": "string (una de: Local, Stock, Trámites, Equipamiento, Marketing, Capital de trabajo)",
      "descripcion": "string (qué incluye, máximo 80 caracteres)",
      "montoMin": number (pesos ARS, entero sin puntos ni comas),
      "montoMax": number (pesos ARS, entero sin puntos ni comas),
      "obligatorio": true o false
    }
  ],
  "consejo": "string (1-2 oraciones con un consejo financiero concreto para este emprendimiento)"
}

Incluí en orden:
${localPropio !== "si" ? '- Local: alquiler 1er mes + depósito 2 meses (obligatorio)' : ''}
- Trámites: habilitaciones municipales y registro (AFIP/Monotributo es gratis, el municipal varía) (obligatorio)
- Equipamiento y mobiliario mínimo para operar (obligatorio)
- Stock o inventario inicial para arrancar (obligatorio)
- Acondicionamiento del local: pintura, señalética, cartel (opcional)
- Marketing inicial: redes sociales, folletería, publicidad online (opcional)
- Capital de trabajo para cubrir los primeros 2 meses de gastos fijos (obligatorio)

Usá precios REALES de Argentina en mayo 2026. Referencia de precios actuales:
- Alquiler local 30-50m2 zona media interior: $300.000-$600.000/mes. CABA: $900.000-$1.500.000/mes.
- Depósito (2 meses) + mes adelantado = 3x alquiler mensual.
- Habilitación municipal + gestor: $80.000-$250.000 según municipio.
- Equipamiento básico (mostrador, estantes, sillas): $400.000-$1.200.000.
- Stock/inventario inicial según rubro: ropa $600.000-$2.000.000, alimentos $300.000-$800.000, tecnología $800.000-$3.000.000.
- Cartel + acondicionamiento básico: $150.000-$500.000.
- Marketing inicial (redes, impresiones, publicidad online): $80.000-$300.000.
- Capital de trabajo 2 meses (alquiler + servicios + sueldos si hay): calculá según los otros ítems.
Adaptá los valores al rubro y zona indicados. Sé realista y específico — estos números tienen que ayudar al emprendedor a saber cuánta plata necesita realmente.
Los montoMin y montoMax deben ser números enteros en pesos ARS, sin puntos ni comas ni signos de pesos.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(content);
    return Response.json(data);
  } catch (error) {
    console.error("Error presupuesto:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
