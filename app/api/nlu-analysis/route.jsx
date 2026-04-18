// app/api/nlu-analysis/route.jsx
import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { conversation, jobRole } = await req.json(); // ✅ App Router uses req.json()

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const userAnswers = conversation
      .filter((msg) => msg.role === "user")
      .map((msg) => msg.content)
      .join(" ");

    const prompt = `
You are an NLP analysis engine. Analyze the following interview answers.

Return ONLY valid JSON with no markdown:
{
  "sentiment_score": <0.0 to 1.0, overall positivity>,
  "nlu_score": <0.0 to 1.0, language quality and clarity>,
  "intent": "<one of: confident, nervous, uncertain, professional, enthusiastic>",
  "skills_detected": ["skill1", "skill2"]
}

Answers:
${userAnswers}

Job Role:
${jobRole}
`;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content;
    const cleaned = text.replace("```json", "").replace("```", "");

    return NextResponse.json(JSON.parse(cleaned)); // ✅ App Router uses NextResponse

  } catch (err) {
    console.error(err);
    return NextResponse.json( // ✅ return, not res.status
      { 
        sentiment_score: 0.5,
        nlu_score: 0.5,
        intent: "neutral",
        skills_detected: [],
      },
      { status: 200 } // ✅ return fallback not 500, so GenerateFeedback doesn't crash
    );
  }
}