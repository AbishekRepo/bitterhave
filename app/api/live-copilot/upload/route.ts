// ============================================================================
// FILE: app/api/live-copilot/upload/route.ts
// SIMPLIFIED: Receives screenshot from .py, calls AI, saves to DB
// ============================================================================

import { createServiceClient } from "@/lib/supabase/supabaseService";

export async function POST(req: Request) {
  try {
    // 1. Auth: Check Bearer token
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const apiKey = authHeader.substring(7);

    // 2. Parse form data
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const imageId = formData.get("image_id") as string | null;
    const filename = formData.get("filename") as string | null;

    if (!imageFile || !imageId || !filename) {
      return Response.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3. Validate session & get session ID
    // Use SERVICE ROLE client to bypass RLS (Python script has no cookies)
    const supabase = createServiceClient();

    console.log("🔍 Looking up session with API key:", apiKey.substring(0, 30) + "...");

    // Use order + limit instead of .single() to avoid "Cannot coerce" error
    const { data: sessions, error: sessionError } = await supabase
      .from("live_copilot_sessions")
      .select("id, api_key")
      .eq("api_key", apiKey)
      .order("created_at", { ascending: false })
      .limit(1);

    if (sessionError) {
      console.error("❌ Session query error:", sessionError);
      return Response.json(
        { success: false, message: "Database error" },
        { status: 500 }
      );
    }

    if (!sessions || sessions.length === 0) {
      console.error("❌ No session found for API key:", apiKey.substring(0, 30));

      // Debug: List all sessions to see what's in DB
      const { data: allSessions } = await supabase
        .from("live_copilot_sessions")
        .select("id, api_key, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      console.log("📋 Recent sessions in DB:", allSessions?.map(s => ({
        id: s.id.substring(0, 8),
        api_key: s.api_key?.substring(0, 25),
      })));

      return Response.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    const session = sessions[0];
    console.log("✅ Session found:", session.id);

    // 4. Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");

    // 5. Call OpenRouter API
    const visionPrompt = `You are an expert interview assistant analyzing a screenshot.
    Analyze this screenshot and provide helpful assistance concisely.`;

    let aiResponseText: string = "";

    try {
      const openRouterApiKey = process.env.OPENROUTER_API_KEY || "";
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "HTTP-Referer": "https://bitterhave.com",
          "X-Title": "Bitterhave",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "google/gemma-3-4b-it:free",
          "messages": [
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": visionPrompt
                },
                {
                  "type": "image_url",
                  "image_url": {
                    "url": `data:${imageFile.type || "image/png"};base64,${base64Image}`
                  }
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "OpenRouter request failed");
      }

      const data = await response.json();
      aiResponseText = data.choices?.[0]?.message?.content || "No response generated.";

    } catch (aiError) {
      console.error("❌ OpenRouter API failed:", aiError);
      aiResponseText = "AI temporarily unavailable.";
    }

    // 6. Save to database
    const { error: insertError } = await supabase
      .from("live_copilot_screenshots")
      .insert({
        session_id: session.id,
        image_id: imageId,
        filename,
        ai_response: aiResponseText,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Insert error:", insertError);
    }

    // 7. Return Response
    return Response.json(
      {
        success: true,
        image_id: imageId,
        ai_response: aiResponseText,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ Upload error:", error);
    return Response.json(
      { success: false, message: "Processing failed" },
      { status: 500 }
    );
  }
}
