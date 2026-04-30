import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, category } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // If no API key is provided, return a mock response for demonstration
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Returning a mock SOP.");
      return NextResponse.json({
        sop: `Mock Standard Operating Procedure (SOP) & Task Requirements\n\n**Project Title:** ${title}\n**Category:** ${category}\n\n**1. Project Overview**\nDescribe the main objective of the project here.\n\n**2. Key Deliverables**\n- Deliverable 1\n- Deliverable 2\n- Deliverable 3\n\n**3. Required Skills & Qualifications**\n- Detail required expertise here.\n\n**4. Timeline & Milestones**\n- Milestone 1: Draft review\n- Milestone 2: Final submission\n\n(Note: This is a mock response because the GEMINI_API_KEY is not set in .env.local)`
      });
    }

    const prompt = `You are an expert project manager and brief writer. Write a detailed Standard Operating Procedure (SOP) and Task Requirement brief for a freelance project. 
Project Title: "${title}"
Category: "${category}"

Please include:
1. Project Overview
2. Key Deliverables
3. Required Skills & Qualifications
4. Timeline & Milestones
Keep it concise, professional, and ready to be posted on a freelance marketplace. Format using Markdown.`;

    const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.0-flash"];
    let generatedText = "";
    let success = false;

    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (generatedText) {
            success = true;
            break;
          }
        } else {
          const err = await response.json();
          console.warn(`Gemini model ${model} failed:`, err);
        }
      } catch (e) {
        console.error(`Error with model ${model}:`, e);
      }
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to generate content from all available AI models' }, { status: 500 });
    }

    return NextResponse.json({ sop: generatedText });

  } catch (error) {
    console.error("Error generating SOP:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
