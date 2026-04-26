import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
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

    const contents = messages.map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat support error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
