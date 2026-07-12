import { config } from "dotenv";

// Initialize dotenv
config();

export async function POST(req) {
  try {
    const { content } = await req.json();
    const formattedContent = Array.isArray(content)
      ? content
      : [
          {
            type: "text",
            text: content,
          },
        ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.SITE_URL,
          "X-Title": process.env.SITE_NAME,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:free",
          messages: [
            {
              role: "user",
              content: formattedContent,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API Error:", data);
      return Response.json(
        { success: false, error: data.error || "Unknown API error" },
        { status: response.status }
      );
    }

    return Response.json(
      {
        success: true,
        data: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error processing AI request:", error);
    return Response.json(
      { success: false, message: "Error processing AI request" },
      { status: 500 }
    );
  }
}
