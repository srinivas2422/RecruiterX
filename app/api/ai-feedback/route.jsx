import { FEEDBACK_PROMPT } from "@/services/Constants";
import OpenAI from "openai";
import { NextResponse } from "next/server";
export async function POST(req) {
    const { jobPosition, jobDescription, conversation, type } = await req.json();
    const cleanedConversation = conversation
  .filter(msg => msg.role !== "system")
  .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
  .join("\n");

    const FINAL_PROMPT= FEEDBACK_PROMPT
  .replace("{{jobPosition}}", jobPosition)
  .replace("{{jobDescription}}", jobDescription)
  .replace("{{interviewType}}", type)
  .replace("{{conversation}}", cleanedConversation);

    try {
        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
        })
        const completion = await openai.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                { role: "user", content: FINAL_PROMPT }
            ],
            temperature: 0.3
        })

        return NextResponse.json(completion.choices[0].message)
    }
    catch (e) {
        console.log(e)
        return NextResponse.json(e)
    }
}