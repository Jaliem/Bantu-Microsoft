import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { submissionText, projectTitle, projectDescription, category, fileUrl } = await request.json();

    if (!submissionText) {
      return NextResponse.json({ error: 'Submission text is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        score: 72,
        grade: 'B',
        feedback: 'Mock review: Your submission looks solid. Make sure deliverables match the SOP requirements exactly. (GEMINI_API_KEY not set)',
        strengths: ['Clear structure', 'Addresses main objective'],
        improvements: ['Add more detail on timeline adherence', 'Include file format specifications'],
        approved: true,
      });
    }

    let parts: any[] = [
      { text: `You are a strict but fair Quality Assurance reviewer for a freelance marketplace called BANTU.
Your job is to pre-audit a student's work submission BEFORE it reaches the client (UMKM).

Project: "${projectTitle}"
Category: "${category}"
Project Requirements/SOP:
${projectDescription || 'No SOP provided.'}

Student's Submission Text:
${submissionText}

${fileUrl ? "An image of the work has also been provided. Please analyze both the text and the image to ensure quality." : ""}

Evaluate this submission and respond ONLY with valid JSON (no markdown, no extra text) in this exact format:
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
- 0-39 (D): Does not meet minimum requirements, resubmit required` }
    ];

    if (fileUrl) {
      try {
        const imageRes = await fetch(fileUrl);
        if (imageRes.ok) {
          const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
          const buffer = await imageRes.arrayBuffer();
          const base64Image = Buffer.from(buffer).toString('base64');
          parts.push({
            inlineData: {
              mimeType: contentType,
              data: base64Image
            }
          });
        }
      } catch (e) {
        console.error("Failed to fetch image for AI review:", e);
      }
    }

    const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.0-flash"];
    let review;
    let success = false;

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          try {
            review = JSON.parse(rawText);
            success = true;
            break;
          } catch (parseError) {
            console.warn(`Failed to parse AI response from ${model}:`, rawText);
          }
        } else {
          console.warn(`Gemini model ${model} failed in review submission`);
        }
      } catch (e) {
        console.error(`Error with model ${model} in review submission:`, e);
      }
    }

    if (!success) {
      // Return a basic fallback review if all models fail
      review = {
        score: 65,
        grade: 'B',
        feedback: 'Submission received. Manual review recommended.',
        strengths: ['Submission completed'],
        improvements: ['Ensure all deliverables are included'],
        approved: true,
      };
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error reviewing submission:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
