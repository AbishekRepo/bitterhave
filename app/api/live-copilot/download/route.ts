// ============================================================================
// FILE: app/api/live-copilot/download/route.ts
// SIMPLIFIED: Generates live_helper.py with embedded API key + sessionId
// ============================================================================

import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/supabaseServer";

function generateApiKey(userId: string) {
  const random = randomBytes(16).toString("hex");
  return `lch_${userId}_${random}`;
}

export async function POST(req: Request) {
  try {
    const { userId, hotkey } = await req.json();

    if (!userId) {
      return Response.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const apiKey = generateApiKey(userId);
    const supabase = await createClient();

    console.log("📝 Creating session for user:", userId);
    console.log("🔑 Generated API key:", apiKey.substring(0, 30) + "...");

    // Create session in database - don't use .single() to avoid coercion errors
    const { data: sessions, error: dbError } = await supabase
      .from("live_copilot_sessions")
      .insert({
        user_id: userId,
        api_key: apiKey,
        session_key: `session_${Date.now()}`,
        hotkey: hotkey || "ctrl+shift+x",
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select();

    if (dbError) {
      console.error("❌ Database insert error:", dbError);
      return Response.json(
        { success: false, message: `Failed to initialize session: ${dbError.message}` },
        { status: 500 }
      );
    }

    if (!sessions || sessions.length === 0) {
      console.error("❌ No session returned after insert");
      return Response.json(
        { success: false, message: "Session creation failed - no data returned" },
        { status: 500 }
      );
    }

    const session = sessions[0];
    console.log("✅ Session created successfully:", session.id);

    const hotkeyPython = (hotkey || "ctrl+shift+x")
      .toLowerCase()
      .replace(/ \+ /g, "+")
      .replace("ctrl", "control");

    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // ========================================================================
    // SIMPLIFIED PYTHON SCRIPT - includes sessionId for web page navigation
    // ========================================================================
    const pythonScript = `import keyboard
from PIL import ImageGrab
import os
from datetime import datetime
import requests
import uuid
from io import BytesIO

# CONFIGURATION
API_KEY = "${apiKey}"
SESSION_ID = "${session.id}"
API_ENDPOINT = "${apiUrl}/api/live-copilot/upload"
HOTKEY = "${hotkeyPython}"
WEB_URL = "${apiUrl}/service/live-copilot/session/${session.id}"

SCREENSHOT_FOLDER = os.path.join(os.path.expanduser("~"), "LiveCopilot", "Screenshots")
if not os.path.exists(SCREENSHOT_FOLDER):
    os.makedirs(SCREENSHOT_FOLDER)

def print_box(text, width=80, style="="):
    print(style * width)
    print(text.center(width))
    print(style * width)

def print_response(response_text, width=80):
    print("\\n" + "="*width)
    print("🤖 AI ASSISTANT RESPONSE".center(width))
    print("="*width)
    
    words = response_text.split()
    lines = []
    current_line = ""
    
    for word in words:
        if len(current_line + word) + 1 <= width - 4:
            current_line += word + " "
        else:
            lines.append(current_line.strip())
            current_line = word + " "
    if current_line:
        lines.append(current_line.strip())
    
    for line in lines:
        print("  " + line)
    
    print("="*width + "\\n")

def take_screenshot():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screenshot_{timestamp}.png"
    filepath = os.path.join(SCREENSHOT_FOLDER, filename)
    
    try:
        screenshot = ImageGrab.grab()
        screenshot.save(filepath)
        print(f"\\n📸 Captured: {filename}")
        upload_to_api(screenshot, filename)
    except Exception as e:
        print(f"Error capturing/saving: {e}")

def upload_to_api(image, filename):
    try:
        image_id = str(uuid.uuid4())
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        buffered.seek(0)
        
        print("📤 Analyzing...")
        
        files = {'image': (f"{image_id}.png", buffered, 'image/png')}
        data = {
            'image_id': image_id, 
            'filename': filename,
        }
        headers = {'Authorization': f'Bearer {API_KEY}'}
        
        response = requests.post(
            API_ENDPOINT, 
            files=files, 
            data=data, 
            headers=headers, 
            timeout=45
        )
        
        if response.status_code in [200, 201]:
            try:
                data = response.json()
                if data.get('ai_response'):
                    print_response(data['ai_response'])
                else:
                    print("✓ Uploaded (No text response)")
            except:
                print("✓ Uploaded")
        else:
            print(f"✗ Failed: {response.status_code} {response.text}")
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")

def main():
    print_box("Live Interview Helper", style="=")
    print(f"Hotkey: {HOTKEY.upper()}")
    print(f"\\n📱 View responses in browser:")
    print(f"   {WEB_URL}")
    print("\\nReady to capture. Press the hotkey anytime.")
    print("To exit, press Ctrl+C")
    print("="*80 + "\\n")
    
    keyboard.add_hotkey(HOTKEY, take_screenshot)
    
    try:
        keyboard.wait()
    except KeyboardInterrupt:
        print("\\nExiting...")

if __name__ == "__main__":
    main()
`;

    return new Response(pythonScript, {
      headers: {
        "Content-Type": "text/x-python",
        "Content-Disposition": 'attachment; filename="live_helper.py"',
        "X-Session-Id": session.id, // Send session ID in header for frontend use
      },
    });
  } catch (error) {
    console.error("❌ Error generating script:", error);
    return Response.json(
      { success: false, message: "Failed to generate script" },
      { status: 500 }
    );
  }
}
