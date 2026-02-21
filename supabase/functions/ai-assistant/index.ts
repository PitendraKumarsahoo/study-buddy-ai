import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  study: `You are an expert AI Study Assistant for college students. You help students understand complex topics in simple language. When asked to:
- Explain a topic: Break it down step by step with examples
- Generate notes: Create well-structured, concise notes with headings and bullet points
- Generate quiz: Create 5 multiple-choice questions with answers and explanations
- Generate flashcards: Create 10 flashcard pairs (term/definition) in a clear format
Always be encouraging and use simple language.`,
  
  chatbot: `You are a friendly AI Student Advisor. You help with:
- Answering academic questions clearly
- Providing career guidance and job market insights
- Study tips and productivity advice
- Course and skill recommendations
Be warm, supportive, and practical. Keep answers concise but helpful.`,
  
  resume: `You are a professional Resume and Cover Letter generator. When asked to:
- Generate a resume: Create a professional, ATS-friendly resume in a clean format with proper sections (Contact, Summary, Education, Skills, Experience, Projects)
- Generate a cover letter: Write a compelling, personalized cover letter
- Suggest improvements: Analyze the provided resume/cover letter and give specific, actionable improvements
Use professional language and modern resume best practices.`,
  
  fake_news: `You are a critical thinking assistant specialized in media literacy and fact-checking. When given a news headline or article:
1. Analyze the language for emotional manipulation, sensationalism, or bias
2. Check for logical fallacies
3. Assess source credibility indicators
4. Look for missing context or one-sided reporting
5. Give a verdict: LIKELY REAL, LIKELY FAKE, or NEEDS VERIFICATION
6. Explain your reasoning clearly
Always encourage users to verify with multiple reputable sources.`,

  recommendations: `You are a personalized learning advisor. Based on the student's interests, current skills, and career goals:
- Suggest 5 relevant online courses with brief descriptions
- Recommend 5 skills to develop with explanations of why
- Suggest a learning path/roadmap
Be specific with course names and platforms (Coursera, edX, Udemy, etc).`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode, stream: shouldStream } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.chatbot;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: shouldStream !== false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (shouldStream !== false) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
