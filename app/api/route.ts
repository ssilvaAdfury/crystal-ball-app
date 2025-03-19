import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai =new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
console.log("API Key:", process.env.OPENAI_API_KEY);
export async function POST(request: Request) {
    try {
      const { userAnswers } = await request.json();
  
      // Construct a prompt using userAnswers for personalization
      // or handle a random fortune scenario if no userAnswers are provided
      const prompt = `
        You are a mystical fortune teller. 
        The user has provided the following information: ${JSON.stringify(userAnswers)}.
        Generate a short fortune, in one to three sentences, in a whimsical, mystical style. 
        Begin each fortune with "Adentus Furiosi says: ", encasing the fortune, not the 'Adentus Furiosi says: ', in quotation marks.`;
  
      // Call OpenAI's Chat Completion endpoint
      const response = await openai.chat.completions.create({
        model: "gpt-4", // or "gpt-4", if you have access
        messages: [
          { role: "system", content: "You are a fortune-telling crystal ball." },
          { role: "user", content: prompt },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });
  
      // Extract the fortune text from the response
      const fortune = response.choices[0]?.message?.content?.trim() || 
        "The crystal ball is hazy... please try again.";
      // Return the fortune as JSON
      return NextResponse.json({ fortune });
    } catch (error) {
      console.error("AI Error:", error);
      return NextResponse.json(
        { error: "Something went wrong generating your fortune." },
        { status: 500 }
      );
    }
  } 