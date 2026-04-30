import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, category } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const rawEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deploymentName = process.env.AZURE_DEPLOYMENT_NAME;
    
    if (!rawEndpoint || !apiKey || !deploymentName) {
      console.warn("Azure OpenAI configuration is missing. Returning a mock SOP.");
      return NextResponse.json({
        sop: `Mock Standard Operating Procedure (SOP) & Task Requirements\n\n**Project Title:** ${title}\n**Category:** ${category}\n\n**1. Project Overview**\nDescribe the main objective of the project here.\n\n**2. Key Deliverables**\n- Deliverable 1\n- Deliverable 2\n- Deliverable 3\n\n**3. Required Skills & Qualifications**\n- Detail required expertise here.\n\n**4. Timeline & Milestones**\n- Milestone 1: Draft review\n- Milestone 2: Final submission\n\n(Note: This is a mock response because the Azure OpenAI configuration is not set in .env.local)`
      });
    }

    const urlObj = new URL(rawEndpoint);
    const baseHost = `${urlObj.protocol}//${urlObj.hostname}`;
    const apiVersion = urlObj.searchParams.get('api-version') || "2024-08-01-preview";
    
    const isResponseApi = urlObj.pathname.includes('/responses');
    const pathSuffix = isResponseApi ? '/responses' : '/chat/completions';
    
    const url = `${baseHost}/openai/deployments/${deploymentName}${pathSuffix}?api-version=${apiVersion}`;

    const prompt = `You are an expert project manager and brief writer. Write a detailed Standard Operating Procedure (SOP) and Task Requirement brief for a freelance project. 
Project Title: "${title}"
Category: "${category}"

Please include:
1. Project Overview
2. Key Deliverables
3. Required Skills & Qualifications
4. Timeline & Milestones
Keep it concise, professional, and ready to be posted on a freelance marketplace. Format using Markdown.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (response.ok) {
      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content || "";
      return NextResponse.json({ sop: generatedText });
    } else {
      const err = await response.json().catch(() => ({}));
      console.error(`Azure OpenAI failed:`, err);
      return NextResponse.json({ error: err.error?.message || 'Failed to generate content' }, { status: response.status });
    }

  } catch (error: any) {
    console.error("Error generating SOP:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
