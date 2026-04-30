import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const rawEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deploymentName = process.env.AZURE_DEPLOYMENT_NAME;

    if (!rawEndpoint || !apiKey || !deploymentName) {
      return NextResponse.json({ error: 'Azure OpenAI configuration missing' }, { status: 500 });
    }

    const systemInstruction = `You are the BANTU customer support assistant. BANTU is an Indonesian platform connecting UMKM (local small and medium businesses) with Mahasiswa (university students) for freelance project-based work.

Key features of BANTU:
- UMKM can post projects (Design, Tech, Marketing) with budgets
- Mahasiswa can browse and apply to projects
- AI-powered SOP generation for project briefs
- Secure escrow payments
- Real-time chat between UMKM and Mahasiswa
- Portfolio building for students
- Email verification required for all accounts

Help users with questions about:
- How to post a job or apply for work
- Account verification and security
- Payments and wallet
- Platform features and navigation
- General questions about BANTU

Be friendly, concise, professional, and helpful. If the user writes in Indonesian (Bahasa), respond in Indonesian. If they write in English, respond in English. Keep responses under 150 words unless detailed explanation is needed.`;

    // Map the standard messages array to the "input" format required by this API
    const inputMessages = [
      { role: 'system', content: systemInstruction },
      ...messages
    ];

    const body = JSON.stringify({
      input: inputMessages,
      max_output_tokens: 800,
      model: deploymentName,
      temperature: 0.7
    });

    const response = await fetch(rawEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: body
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Azure OpenAI Response Error]', JSON.stringify(data, null, 2));
      return NextResponse.json({ 
        error: data.error?.message || 'Failed to get AI response'
      }, { status: response.status });
    }

    // New parsing logic for the 2026 "output" format
    const reply = data.output?.[0]?.content?.[0]?.text || "";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat support error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
