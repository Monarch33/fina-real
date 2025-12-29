import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { messages, mode = 'technical' } = await request.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ success: false, error: 'No API key' });
    }

    // Construire un résumé explicite de la conversation
    let conversationSummary = "CONVERSATION HISTORY:\n";
    messages.forEach((m: any, i: number) => {
      conversationSummary += `${i + 1}. ${m.role.toUpperCase()}: ${m.content}\n`;
    });

    const systemPrompt = `You are a finance interviewer at Jane Street. You are in the middle of an interview.

${conversationSummary}

CRITICAL INSTRUCTIONS:
- The candidate just gave their latest response (the last USER message above)
- You must RESPOND to what they said - acknowledge it, evaluate it, give feedback
- Then either:
  A) Ask a FOLLOW-UP if their answer was incomplete
  B) Move to a COMPLETELY NEW TOPIC if their answer was good
  C) End the interview if you've covered 4-5 different topics

ABSOLUTE RULES:
- NEVER repeat any question you already asked (look at the history above!)
- NEVER ask about something you already discussed
- Keep your response under 50 words
- Be conversational and natural
- If ending, say "Thanks for your time, that concludes our interview."

What is your next response as the interviewer?`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${OPENAI_API_KEY}` 
      },
      body: JSON.stringify({ 
        model: 'gpt-4o', 
        messages: [{ role: 'user', content: systemPrompt }],
        max_tokens: 150, 
        temperature: 0.9
      })
    });

    if (!response.ok) {
      console.error('OpenAI error:', await response.text());
      return NextResponse.json({ success: false, error: 'OpenAI error' });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content?.trim() || '';
    
    const isEnding = reply.toLowerCase().includes('concludes') || 
                     (reply.toLowerCase().includes('thank') && reply.toLowerCase().includes('time'));
    
    const score = 50 + Math.floor(Math.random() * 35);

    return NextResponse.json({ success: true, reply, score, isEnding });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' });
  }
}
