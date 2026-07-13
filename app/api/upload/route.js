import { updateStatus, isBusy } from "@/app/lib/status";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image");
    const imageId = formData.get("image_id");
    const filename = formData.get("filename");
    const timestamp = formData.get("timestamp");

    // Busy check and the "receiving" claim below run in one synchronous
    // block (no await between), so two near-simultaneous requests can't
    // both pass. A rejected request must not touch the in-progress run's
    // status — which is also why this check precedes the no-image branch
    // and its error status update.
    if (isBusy()) {
      return Response.json(
        {
          success: false,
          message: "A screenshot is already being processed. Please wait.",
        },
        { status: 409 }
      );
    }

    if (!imageFile) {
      updateStatus({
        stage: "error",
        message: "No image received",
        error: "No image file provided",
      });
      return Response.json(
        { success: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    updateStatus({
      stage: "receiving",
      message: "Screenshot received, extracting text...",
      filename,
      timestamp,
      imageId,
      data: null,
      error: null,
    });

    console.log(`✓ Received file: ${filename}, image_id: ${imageId}`);

    // Convert to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    console.log("📄 Extracting text using OCR.space (FREE)...");
    updateStatus({ stage: "ocr", message: "Extracting text via OCR..." });

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
      const ocrError =
        ocrData?.ErrorMessage || ocrData?.ErrorDetails || "Unknown OCR error";
      updateStatus({ stage: "error", message: "OCR failed", error: ocrError });
      return Response.json(
        {
          success: false,
          message: "OCR failed",
          error: ocrError,
          ocrResponse: ocrData,
        },
        { status: 500 }
      );
    }

    // Safely extract text
    const extractedText = ocrData.ParsedResults?.[0]?.ParsedText?.trim() || "";

    if (!extractedText) {
      updateStatus({
        stage: "error",
        message: "No text extracted from image",
        error: "No text extracted",
      });
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
    updateStatus({ stage: "ai", message: "Asking AI for an answer..." });

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

    if (!aiData.success) {
      const aiError =
        (typeof aiData.error === "string" && aiData.error) ||
        aiData.error?.message ||
        "Unknown AI error";
      updateStatus({ stage: "error", message: "AI request failed", error: aiError });
      return Response.json(
        {
          success: false,
          message: "AI request failed",
          error: aiError,
          received: { filename, timestamp, imageId, extractedText },
        },
        { status: 502 }
      );
    }

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
    updateStatus({ stage: "done", message: "Response ready", data: responseData });

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
    updateStatus({
      stage: "error",
      message: "Unexpected server error",
      error: err.message,
    });
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
