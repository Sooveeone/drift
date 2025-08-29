import { Request, Response } from "express";
import { InferenceClient } from "@huggingface/inference";
import Schedule from "../models/Schedule";
import { addDocs, queryDocs } from "../utils/chromaRAG";
import 'dotenv/config';

const HUGGINGFACEHUB_API_KEY = process.env.HUGGINGFACEHUB_API_KEY;

const client = new InferenceClient(HUGGINGFACEHUB_API_KEY);

export const generateSchedule = async (req: Request, res: Response) => {
  const { goal, startDate, endDate, intensity, category } = req.body;
  console.log(`📋 Schedule request received - Goal: "${goal}", Category: "${category}"`);
  
  if (!goal || !startDate || !endDate || !intensity || !category) {
    console.log(`❌ Missing fields - goal: ${!!goal}, startDate: ${!!startDate}, endDate: ${!!endDate}, intensity: ${!!intensity}, category: ${!!category}`);
    return res.status(400).json({ message: "All fields are required" });
  }

  // Override startDate to today (YYYY-MM-DD)
  const todayDate = new Date().toISOString().split("T")[0];

  // Test HuggingFace API key first
  console.log("🔑 Testing HuggingFace API key...");
  try {
    const testCompletion = await client.chatCompletion({
      provider: "fireworks-ai",
      model: "deepseek-ai/DeepSeek-R1",
      messages: [{ role: "user", content: "Test" }],
    });
    console.log("✅ HuggingFace API key works!");
  } catch (error) {
    console.error("❌ HuggingFace API key failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ message: "HuggingFace API error", error: errorMessage });
  }

  // RAG - with error handling
  let knowledge = "";
  try {
    console.log("🔍 Starting RAG process...");
    // Only add docs if collection is empty (more efficient)
    const docs = await queryDocs(goal, category);
    knowledge = docs.map((doc: any) => doc.pageContent).join("\n");
    console.log("✅ RAG knowledge retrieved successfully");
  } catch (error) {
    console.error("❌ RAG failed, using fallback knowledge:", error);
    // Fallback to hardcoded knowledge based on category
    switch (category) {
      case "fitness":
        knowledge = "Focus on progressive overload, compound exercises (squats, deadlifts, bench press), proper form, adequate protein intake (1.6-2.2g per kg bodyweight), rest and recovery. Train 3-4 times per week with full-body or upper/lower splits.";
        break;
      case "study":
        knowledge = "Use active recall, spaced repetition, interleaved practice. Break study sessions into 25-45 minute blocks with breaks. Focus on understanding over memorization. Create summary notes and practice with past papers.";
        break;
      case "work":
        knowledge = "Prioritize important tasks, use time-blocking, focus on one task at a time. Set clear goals, track progress, and maintain work-life balance. Develop skills that align with your career objectives.";
        break;
      default:
        knowledge = "Break down your goal into smaller, manageable tasks. Create a realistic timeline, stay consistent, and track your progress regularly.";
    }
  }


  // Compose a prompt for the AI model
  //   const prompt = `Create a detailed schedule to achieve the following goal: "${goal}".
  // Start date: ${startDate}
  // End date: ${endDate}
  // Intensity: ${intensity}
  // Please break down the goal into actionable steps and distribute them over the given time period.`;

  const prompt = `

You are a daily goal planner AI.

Based on the following:

Goal: ${goal}
Start Date: ${todayDate}
End Date: ${endDate}
Intensity: ${intensity}

Generate a day-by-day schedule from start to end date.

Useful knowledge:
${knowledge}

Each day must include 1–4 specific tasks, depending on intensity:

- Casual: 1–2 light tasks/day
- Moderate: 2–3 moderate tasks/day
- Intense: 3–4 challenging tasks/day

Format the output as:
DayOfWeek, Month Day|task|task|...;

Use this format exactly—no JSON, no markdown, no extra text.

Tasks must be helpful, clear, short, concise and goal-oriented.
Only return the schedule.

For example:
Monday, May 26|Research topic|Draft outline|Read supporting material;
Tuesday, May 27|Write intro|Revise outline;
Wednesday, May 28|Complete first draft|Peer review;
`;

console.log("===================================================================");
console.log(prompt)
console.log("===================================================================");



  try {
    const chatCompletion = await client.chatCompletion({
      provider: "fireworks-ai",
      model: "deepseek-ai/DeepSeek-R1",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawOutput =
      chatCompletion.choices?.[0]?.message?.content || "No schedule returned";

    const thinkEndIndex = rawOutput.indexOf("</think>");
    const schedule =
      thinkEndIndex !== -1
        ? rawOutput.slice(thinkEndIndex + "</think>".length).trim()
        : rawOutput.trim();

    // Note: Schedule saving is now handled by the frontend through the schedule API
    // This endpoint only generates and returns the schedule data




    console.log(`✅ Schedule generated successfully, length: ${schedule.length} characters`);
    console.log(`📤 Sending schedule response to frontend`);
    res.json({ schedule });
  } catch (error: any) {
    console.error("❌ Hugging Face API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res
      .status(500)
      .json({ message: "Hugging Face API error", error: errorMessage });
  }
};
