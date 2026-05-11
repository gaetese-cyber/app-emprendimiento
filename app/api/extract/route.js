import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Analizá la conversación y extraé la información del usuario para pre-llenar un formulario.
Devolvé SOLO un JSON válido con estos campos. Si un dato no se mencionó dejá el campo vacío "":

{
  "capital": "monto numérico sin puntos ni comas ni símbolos, ej: 500000. Si dijo '500 mil' ponés 500000",
  "zona": "ciudad y país separados por coma, ej: Rosario, Argentina. Completá el país si es obvio por el contexto",
  "intereses": "habilidades o intereses en pocas palabras, ej: venta de ropa, cocina, atención al cliente",
  "localPropio": "si" si mencionó tener local o espacio propio, "no" si dijo que no tiene o no lo mencionó",
  "modalidad": "solo" si trabaja solo, "socio" si mencionó un socio, "equipo" si mencionó varios empleados o equipo",
  "horasDiarias": "número entero de horas, ej: 6. Si dijo medio tiempo ponés 4, tiempo completo ponés 8"
}

Respondé ÚNICAMENTE con el JSON, sin explicaciones ni texto adicional.`,
        },
        ...messages,
      ],
    });

    const data = JSON.parse(completion.choices[0].message.content);
    return Response.json(data);
  } catch (error) {
    console.error("Error:", error.message);
    return Response.json({}, { status: 500 });
  }
}
