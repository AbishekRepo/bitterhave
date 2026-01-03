// ============================================================================
// FILE: app/api/roadmap/generate/route.ts
// Generates interview prep roadmap from job description using AI
// ============================================================================

import { createClient } from "@/lib/supabase/supabaseServer";

export async function POST(req: Request) {
    try {
        const { jobDescription, interviewDate, userId } = await req.json();

        if (!jobDescription || !userId) {
            return Response.json(
                { success: false, message: "Job description and user ID are required" },
                { status: 400 }
            );
        }

        // Calculate days remaining if date provided
        let daysRemaining: number | null = null;
        if (interviewDate) {
            const today = new Date();
            const interview = new Date(interviewDate);
            const diffTime = interview.getTime() - today.getTime();
            daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Construct AI prompt
        const timeConstraint = daysRemaining
            ? `The user has ${daysRemaining} days until their interview. Prioritize topics accordingly and suggest a realistic daily study plan.`
            : "No specific timeline provided. Create a comprehensive roadmap ordered by priority.";

        const systemPrompt = `You are an expert career coach and interview preparation specialist. Analyze the provided job description and create a structured interview preparation roadmap.

${timeConstraint}

Return ONLY valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):
{
  "topics": [
    {
      "topic": "Topic Name",
      "description": "Brief description of what to study and why it's important for this role",
      "estimatedHours": 5,
      "priority": "high",
      "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"]
    }
  ],
  "totalHours": 40
}

Guidelines:
- Extract key technical skills, tools, and concepts from the job description
- Include both technical and soft skills preparation
- Priority should be "high", "medium", or "low"
- estimatedHours should be realistic (1-20 hours per topic)
- Include 5-10 topics typically
- Order topics by priority (high first)
- totalHours should be the sum of all estimatedHours`;

        // Call OpenRouter API
        const openRouterApiKey = process.env.OPENROUTER_API_KEY || "";

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openRouterApiKey}`,
                "HTTP-Referer": "https://bitterhave.com",
                "X-Title": "Bitterhave Roadmap Generator",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.2-3b-instruct:free",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: `Here is the job description to analyze:\n\n${jobDescription}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenRouter API error:", errorData);
            throw new Error(errorData.error?.message || "AI service unavailable");
        }

        const aiResult = await response.json();
        const aiContent = aiResult.choices?.[0]?.message?.content || "";

        // Parse JSON response
        let roadmapData;
        try {
            // Try to extract JSON from the response (in case AI wraps it)
            const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                roadmapData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("No valid JSON in response");
            }
        } catch (parseError) {
            console.error("Failed to parse AI response:", parseError);
            // Return a fallback response
            roadmapData = {
                topics: [
                    {
                        topic: "Technical Skills Review",
                        description: "Review core technical skills mentioned in the job description",
                        estimatedHours: 10,
                        priority: "high",
                        subtopics: ["Core concepts", "Practical exercises", "Documentation review"]
                    },
                    {
                        topic: "System Design",
                        description: "Practice system design and architecture concepts",
                        estimatedHours: 8,
                        priority: "high",
                        subtopics: ["Scalability", "Database design", "API design"]
                    },
                    {
                        topic: "Behavioral Interview Prep",
                        description: "Prepare STAR format answers for common behavioral questions",
                        estimatedHours: 5,
                        priority: "medium",
                        subtopics: ["Leadership examples", "Conflict resolution", "Achievement stories"]
                    },
                    {
                        topic: "Company Research",
                        description: "Research the company, culture, and recent news",
                        estimatedHours: 3,
                        priority: "medium",
                        subtopics: ["Company values", "Recent products", "Industry position"]
                    },
                    {
                        topic: "Mock Interviews",
                        description: "Practice with mock interviews and coding challenges",
                        estimatedHours: 6,
                        priority: "high",
                        subtopics: ["Technical rounds", "Behavioral rounds", "Q&A practice"]
                    }
                ],
                totalHours: 32
            };
        }

        // Save to database
        const supabase = await createClient();

        // Insert roadmap
        const { data: roadmapRecord, error: roadmapError } = await supabase
            .from("roadmaps")
            .insert({
                user_id: userId,
                job_description: jobDescription,
                interview_date: interviewDate || null,
                total_hours: roadmapData.totalHours || 0,
            })
            .select()
            .single();

        if (roadmapError) {
            console.error("Error saving roadmap:", roadmapError);
            // Still return the data even if DB save fails
        }

        // Insert roadmap items if roadmap was saved
        if (roadmapRecord && roadmapData.topics) {
            const items = roadmapData.topics.map((topic: {
                topic: string;
                description: string;
                estimatedHours: number;
                priority: string;
                subtopics?: string[];
            }, index: number) => ({
                roadmap_id: roadmapRecord.id,
                topic: topic.topic,
                description: topic.description,
                estimated_hours: topic.estimatedHours,
                priority: topic.priority,
                subtopics: topic.subtopics || [],
                order_index: index,
                is_completed: false,
            }));

            const { error: itemsError } = await supabase
                .from("roadmap_items")
                .insert(items);

            if (itemsError) {
                console.error("Error saving roadmap items:", itemsError);
            }
        }

        // Decrement sparks from user (2 sparks for roadmap)
        const { data: userData } = await supabase
            .from("users")
            .select("sparks")
            .eq("id", userId)
            .single();

        if (userData && userData.sparks > 0) {
            const newSparks = Math.max(0, (userData.sparks || 0) - 2);
            const { error: sparksError } = await supabase
                .from("users")
                .update({ sparks: newSparks })
                .eq("id", userId);

            if (sparksError) {
                console.error("Failed to decrement sparks:", sparksError);
            } else {
                console.log(`✅ Decremented 2 sparks for user ${userId}. New balance: ${newSparks}`);
            }
        }

        return Response.json(roadmapData, { status: 200 });

    } catch (error) {
        console.error("Roadmap generation error:", error);
        return Response.json(
            { success: false, message: error instanceof Error ? error.message : "Failed to generate roadmap" },
            { status: 500 }
        );
    }
}
