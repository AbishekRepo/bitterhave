export async function GET() {
  try {
    // In a real application, you would fetch this from a database
    // For now, we're using a global variable as a simple storage
    const aiResponse = global.lastAIResponse;

    if (!aiResponse) {
      return Response.json(
        { success: false, message: "No response found yet" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        data: aiResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error retrieving AI response:", error);
    return Response.json(
      { success: false, message: "Error retrieving AI response" },
      { status: 500 }
    );
  }
}
