import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { submissionText, projectTitle, projectDescription, category, fileUrl } = await request.json();

    if (!submissionText) {
      return NextResponse.json({ error: 'Submission text is required' }, { status: 400 });
    }

    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const rawEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deploymentName = process.env.AZURE_DEPLOYMENT_NAME;

    if (!rawEndpoint || !apiKey || !deploymentName) {
      return NextResponse.json({
        score: 72,
        grade: 'B',
        feedback: 'Mock review: Your submission looks solid. Make sure deliverables match the SOP requirements exactly. (Azure OpenAI configuration not set)',
        strengths: ['Clear structure', 'Addresses main objective'],
        improvements: ['Add more detail on timeline adherence', 'Include file format specifications'],
        approved: true,
      });
    }

    const urlObj = new URL(rawEndpoint);
    const baseHost = `${urlObj.protocol}//${urlObj.hostname}`;
    const apiVersion = urlObj.searchParams.get('api-version') || "2024-08-01-preview";
    
    const isResponseApi = urlObj.pathname.includes('/responses');
    const pathSuffix = isResponseApi ? '/responses' : '/chat/completions';
    
    const url = `${baseHost}/openai/deployments/${deploymentName}${pathSuffix}?api-version=${apiVersion}`;

    const systemInstruction = `You are a strict but fair Quality Assurance reviewer for a freelance marketplace called BANTU.
Your job is to pre-audit a student's work submission BEFORE it reaches the client (UMKM).

Evaluate the submission and respond ONLY with valid JSON (no markdown, no extra text) in this exact format:
{
  "score": <integer 0-100>,
  "grade": "<S|A|B|C|D>",
  "feedback": "<2-3 sentence overall feedback in Bahasa Indonesia>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<area to improve 1>", "<area to improve 2>"],
  "approved": <true if score >= 60, false otherwise>
}

Scoring guide:
- 90-100 (S): Exceptional, exceeds all requirements
- 75-89 (A): Strong, meets all requirements well
- 60-74 (B): Satisfactory, meets most requirements
- 40-59 (C): Needs significant improvement before client review
- 0-39 (D): Does not meet minimum requirements, resubmit required`;

    const userPrompt = `Project: "${projectTitle}"
Category: "${category}"
Project Requirements/SOP:
${projectDescription || 'No SOP provided.'}

Student's Submission Text:
${submissionText}

${fileUrl ? "An image of the work has also been provided. Please analyze both the text and the image to ensure quality." : ""}`;

    const content: any[] = [{ type: 'text', text: userPrompt }];

    if (fileUrl) {
      try {
        const imageRes = await fetch(fileUrl);
        if (imageRes.ok) {
          const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
          const buffer = await imageRes.arrayBuffer();
          const base64Image = Buffer.from(buffer).toString('base64');
          content.push({
            type: 'image_url',
            image_url: {
              url: `data:${contentType};base64,${base64Image}`
            }
          });
        }
      } catch (e) {
        console.error("Failed to fetch image for AI review:", e);
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: content }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || '{}';
      return NextResponse.json(JSON.parse(rawText));
    } else {
      const err = await response.json().catch(() => ({}));
      console.error(`Azure OpenAI failed in review:`, err);
      return NextResponse.json({
        score: 65,
        grade: 'B',
        feedback: 'Submission received. Manual review recommended.',
        strengths: ['Submission completed'],
        improvements: ['Ensure all deliverables are included'],
        approved: true,
      });
    }

  } catch (error: any) {
    console.error('Error reviewing submission:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
