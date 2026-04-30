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
      console.warn('[Generate SOP] Azure OpenAI configuration missing — returning mock SOP');
      return NextResponse.json({
        sop: `Mock Standard Operating Procedure (SOP) & Task Requirements\n\n**Project Title:** ${title}\n**Category:** ${category}\n\n**1. Project Overview**\nDescribe the main objective of the project here.\n\n**2. Key Deliverables**\n- Deliverable 1\n- Deliverable 2\n- Deliverable 3\n\n**3. Required Skills & Qualifications**\n- Detail required expertise here.\n\n**4. Timeline & Milestones**\n- Milestone 1: Draft review\n- Milestone 2: Final submission\n\n(Note: This is a mock response because Azure OpenAI is not configured in .env.local)`,
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

    console.log(`[Generate SOP] Calling Azure OpenAI for title="${title}" category="${category}"`);

    const response = await fetch(rawEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: deploymentName,
        input: [{ role: 'user', content: prompt }],
        max_output_tokens: 2000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Generate SOP] Azure OpenAI error:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: data.error?.message || 'Failed to generate SOP' },
        { status: response.status }
      );
    }

    const generatedText: string = data.output?.[0]?.content?.[0]?.text ?? '';
    console.log(`[Generate SOP] Successfully generated SOP (${generatedText.length} chars)`);
    return NextResponse.json({ sop: generatedText });

  } catch (error: any) {
    console.error('[Generate SOP] Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
