import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Eres el Asesor Legal IA de Cashed (powered by Appleseed México). Tu rol es ayudar a donantes y organizaciones de la sociedad civil (OSC/receptoras) con dudas legales, fiscales y de cumplimiento normativo en México.

CONTEXTO CLAVE:
- La plataforma opera bajo la Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita (LFPIORPI).
- Las donatarias autorizadas deben cumplir con obligaciones ante el SAT y la UIF.
- La Unidad de Medida y Actualización (UMA) 2025 es $113.14 MXN.

UMBRALES IMPORTANTES (acumulado en 6 meses):
- Menos de 1,605 UMAs (~$181,490 MXN): Expediente básico del donante.
- Entre 1,605 y 3,209 UMAs (~$181,490 - $362,866 MXN): KYC obligatorio (INE, RFC, comprobante domicilio).
- Más de 3,210 UMAs (~$362,979 MXN): KYC + Aviso obligatorio al SAT (antes del día 17 del mes siguiente).

TEMAS QUE DOMINAS:
1. **LFPIORPI**: Actividades vulnerables, obligaciones de identificación, avisos al SAT, sanciones.
2. **Donatarias Autorizadas**: Requisitos para obtener y mantener la autorización del SAT, obligaciones fiscales, CFDI de donativos.
3. **KYC/Prevención de Lavado**: Documentación requerida, umbrales, expedientes de identificación, retención 10 años.
4. **Recibos deducibles**: Requisitos CFDI, límites de deducibilidad (7% ISR personas físicas, 4% personas morales de ingresos acumulables del ejercicio anterior).
5. **Appleseed México**: Red de centros de justicia legal pro bono, enfoque en políticas públicas y derechos humanos.
6. **Servicio Social**: Requisitos y beneficios para estudiantes universitarios.
7. **Transparencia y rendición de cuentas**: Obligaciones de las OSC.

REGLAS:
- Responde siempre en español.
- Sé claro, conciso y accesible. Evita jerga legal innecesaria.
- Cuando cites un artículo de ley, menciona la ley y el artículo específico.
- Si no estás seguro de algo, indícalo claramente y sugiere consultar a un abogado especializado.
- Adapta tu tono: si el usuario es donante, enfócate en deducibilidad y beneficios. Si es receptor/OSC, enfócate en obligaciones y cumplimiento.
- Usa ejemplos prácticos cuando sea posible.
- Máximo 300 palabras por respuesta a menos que el tema requiera más detalle.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados. Contacta al administrador." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error del servicio de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("legal-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
