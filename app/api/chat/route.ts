import { openai, SYSTEM_PROMPT, HULL_CONTEXT } from '@/lib/openai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT + '\n\n' + HULL_CONTEXT },
      ...history,
      { role: 'user' as const, content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.8,
      max_tokens: 500,
    });

    const aiMessage = response.choices[0].message.content;

    return NextResponse.json({ 
      message: aiMessage,
      success: true 
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response', success: false },
      { status: 500 }
    );
  }
}
