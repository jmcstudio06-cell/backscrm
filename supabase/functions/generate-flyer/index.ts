import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { shows, artistName, instagram, format, templateType } = await req.json();

    // Build show list text for the prompt
    const showLines = (shows || [])
      .map((s: any) => {
        const date = new Date(s.date + "T12:00:00");
        const day = date.getDate();
        const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
        const month = monthNames[date.getMonth()];
        const weekDays = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
        const weekDay = weekDays[date.getDay()];
        const venue = s.venue || s.address || "";
        const time = s.start_time || "";
        return `- Dia ${day} ${month} (${weekDay}) | ${s.title} | ${venue} ${time ? "| " + time : ""}`;
      })
      .join("\n");

    const isStories = format === "stories";
    const aspectRatio = isStories ? "9:16" : "1:1";

    let styleInstruction = "";
    switch (templateType) {
      case "mensal":
        styleInstruction = `Create a PREMIUM monthly music agenda flyer. Style: Dark navy/midnight blue background with vibrant cyan/teal gradient accents. Modern geometric shapes. The artist photo should be a circular cutout at the top center. Title "AGENDA MENSAL" in bold gradient text. Show dates in a clean grid layout with large day numbers and venue names. Instagram handle at the bottom.`;
        break;
      case "hoje":
        styleInstruction = `Create a PREMIUM "TODAY'S SHOW" music flyer. Style: Rich teal/cyan gradient background with elegant wave textures. Large artist photo centered. Big stylish script text saying "Hoje" (Today). Show details prominently displayed: venue, time, city. Vibrant and eye-catching with professional typography.`;
        break;
      case "classico":
        styleInstruction = `Create a PREMIUM "Próximos Shows" (upcoming shows) music flyer. Style: Dark sophisticated background with angular geometric overlays in dark gray tones creating depth. Red accent lines (horizontal, thin) framing the content. Circular artist photo at the top center with subtle white ring. Artist name in clean white font below photo. "Próximos Shows" subtitle in red italic font. Show dates in a 2-column grid with large bold day numbers, venue names next to them, and month abbreviations below. Modern, elegant, professional feel.`;
        break;
      case "editorial":
        styleInstruction = `Create a PREMIUM editorial-style music agenda flyer. Style: Very dark background like a concert poster. Artist photo on the right side with artistic paint-splash/ink effect frame. "AGENDA SEMANAL" in bold editorial typography top-left. Show dates listed vertically on the left side with italic serif day numbers. Concert atmosphere with subtle bokeh lights in the background. Magazine-quality typography and layout.`;
        break;
      default:
        styleInstruction = `Create a PREMIUM music show announcement flyer with dark elegant background, vibrant color accents, and professional typography.`;
    }

    const prompt = `${styleInstruction}

IMPORTANT DETAILS TO INCLUDE ON THE FLYER:
- Artist name: "${artistName}"
${instagram ? `- Instagram: ${instagram}` : ""}
- Shows/dates to display:
${showLines || "No shows scheduled - write 'EM BREVE' (Coming Soon)"}
- Small watermark at the very bottom: "BACKSTAGE PRO"

The flyer must be ${isStories ? "vertical (portrait, 9:16 ratio for Instagram Stories)" : "square (1:1 ratio for Instagram Feed)"}.
Make it look like it was designed by a professional graphic designer. Use premium gradients, clean typography, and modern layout. The text must be LEGIBLE and well-spaced. DO NOT include any placeholder photos - only use text, shapes, gradients, and geometric elements for the design.`;

    console.log("Generating flyer with AI...", { templateType, format, showCount: shows?.length });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      throw new Error("AI did not return an image");
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-flyer error:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
