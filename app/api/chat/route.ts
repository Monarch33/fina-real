import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { messages, mode = 'technical' } = await request.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ success: false, error: 'No API key' });
    }

    console.log('Received messages:', JSON.stringify(messages, null, 2)); // Debug

    const systemPrompt = `You are a senior interviewer at Jane Street conducting a ${mode} interview. You're having a natural conversation with a candidate.

IMPORTANT RULES:
1. NEVER repeat a question you already asked - check the conversation history
2. If the candidate's answer is good, move to a NEW topic
3. If incomplete, ask them to clarify that specific point
4. After 5-6 exchanges, wrap up naturally: "Thanks for your time, that covers what I wanted to discuss."
5. Keep responses under 50 words
6. Be natural, like a real human interviewer`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${OPENAI_API_KEY}` 
      },
      body: JSON.stringify({ 
        model: 'gpt-4o', 
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ], 
        max_tokens: 150, 
        temperature: 0.85
      })
    });

    if (!response.ok) {
      console.error('OpenAI error:', await response.text());
      return NextResponse.json({ success: false, error: 'OpenAI error' });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content?.trim() || '';
    
    console.log('AI reply:', reply); // Debug

    const isEnding = reply.toLowerCase().includes('thank') && reply.toLowerCase().includes('time');
    const score = Math.min(100, 50 + Math.floor(Math.random() * 30));

    return NextResponse.json({ success: true, reply, score, isEnding });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' });
  }
}
