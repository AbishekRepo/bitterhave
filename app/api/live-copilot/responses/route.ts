// ============================================================================
// FILE: app/api/live-copilot/responses/route.ts
// SIMPLIFIED: Get AI responses for a specific session
// ============================================================================

import { createServiceClient } from "@/lib/supabase/supabaseService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!sessionId) {
      return Response.json(
        { success: false, message: "Session ID is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get screenshots with AI responses for this session
    const { data: screenshots, error: screenshotsError } = await supabase
      .from("live_copilot_screenshots")
      .select(`
        id,
        session_id,
        image_id,
        filename,
        ai_response,
        created_at
      `)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (screenshotsError) {
      console.error("❌ Failed to fetch screenshots:", screenshotsError);
      return Response.json(
        { success: false, message: "Failed to fetch responses" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      responses: screenshots || [],
      count: screenshots?.length || 0,
    });
  } catch (error) {
    console.error("❌ Error fetching responses:", error);
    return Response.json(
      { success: false, message: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}
