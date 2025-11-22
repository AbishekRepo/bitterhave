export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image");
    const imageId = formData.get("image_id");
    const filename = formData.get("filename");
    const timestamp = formData.get("timestamp");

    if (!imageFile) {
      return Response.json(
        { success: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    console.log(`✓ Received file: ${filename}, image_id: ${imageId}`);

    // Convert to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    console.log("📄 Extracting text using OCR.space (FREE)...");

    // OCR.space API call with API key
    const ocrFormData = new FormData();
    ocrFormData.append("base64Image", `data:image/png;base64,${base64Image}`);
    ocrFormData.append("language", "eng");
    ocrFormData.append("isOverlayRequired", "false");
    ocrFormData.append("apikey", process.env.OCR_SPACE_API_KEY); // Add API key

    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: ocrFormData,
    });

    const ocrData = await ocrResponse.json();

    console.log("OCR Response:", JSON.stringify(ocrData, null, 2));

    // Check if the response is valid
    if (!ocrData || ocrData.IsErroredOnProcessing === true) {
      return Response.json(
        {
          success: false,
          message: "OCR failed",
          error:
            ocrData?.ErrorMessage ||
            ocrData?.ErrorDetails ||
            "Unknown OCR error",
          ocrResponse: ocrData,
        },
        { status: 500 }
      );
    }

    // Safely extract text
    const extractedText = ocrData.ParsedResults?.[0]?.ParsedText?.trim() || "";

    if (!extractedText) {
      return Response.json(
        {
          success: false,
          message: "No text extracted from image",
          ocrResponse: ocrData,
        },
        { status: 500 }
      );
    }

    console.log("✓ Text extracted successfully");
    console.log("🤖 Sending extracted text to AI API...");

    const aiResponse = await fetch(new URL("/api/ai", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: [
          {
            type: "text",
            text: `        
You are given raw extracted text from an image or screenshot.
The screenshot may come from Notepad, a code editor, a browser, VS Code, a PDF, or any other interface.
The extracted text may contain a question, an assessment prompt, code snippets, explanations, or notes.

Your primary duty:
- Understand whether the extracted text contains a question, problem statement, task, or a code snippet that needs explanation, debugging, or completion.
- Based on that, provide the most accurate, correct, and helpful answer possible.

Your tasks:
1. Identify what the extracted text represents (question, code snippet, error log, instructions, notes, etc.).
2. Interpret the intent and respond with a clear and correct solution or explanation.

Important rule:
- If the extracted text does NOT contain any meaningful question, instruction, or relevant content, respond with exactly:
  **"No question found, please try with a new image."**

Extracted text:
${extractedText}
`,
          },
        ],
        filename,
        timestamp,
        imageId,
        extractedText,
      }),
    });

    const aiData = await aiResponse.json();

    if (!global.aiResponses) global.aiResponses = [];
    const responseData = {
      ...aiData,
      filename,
      timestamp,
      imageId,
      extractedText,
    };

    global.aiResponses.push(responseData);
    global.lastAIResponse = responseData;

    return Response.json(
      {
        success: true,
        message: "OCR + AI processing successful",
        received: {
          filename,
          timestamp,
          imageId,
          imageSize: buffer.length,
          extractedText,
        },
        aiResponse: aiData,
        responseId: timestamp,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error:", err);
    return Response.json(
      {
        success: false,
        message: "Error processing request",
        error: err.message,
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}
