import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userMessage,
      messages = [], // Full conversation history in OpenAI format
      mode = 'technical'
    } = body;

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        message: "API key missing", 
        score: 50
      });
    }

    const systemMessage = `You are a senior interviewer at a top finance firm (Jane Street, Citadel level) conducting a ${mode} interview.

BEHAVE EXACTLY LIKE A REAL HUMAN INTERVIEWER:
- Listen to what the candidate says
- If their answer is good: acknowledge briefly and ask a NEW different question
- If their answer has errors: politely correct them and probe deeper
- If their answer is incomplete: ask them to elaborate on the missing part
- After 5-7 good exchanges: naturally wrap up the interview

CRITICAL RULES:
- NEVER repeat a question you already asked
- NEVER ask the same thing twice in different words
- Keep responses concise (under 50 words)
- Be professional but warm
- Ask only ONE question at a time
- When wrapping up, say something like "Great, that covers what I wanted to discuss. Thanks for your time."

You are having a real conversation. Respond naturally.`;

    // Build messages array - this is key!
    // We send the FULL conversation history so GPT knows what was already asked
    const apiMessages = [
      { role: 'system', content: systemMessage },
      ...messages, // All previous messages
      { role: 'user', content: userMessage } // Current user response
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${OPENAI_API_KEY}` 
      },
      body: JSON.stringify({ 
        model: 'gpt-4o', 
        messages: apiMessages, 
        max_tokens: 150, 
        temperature: 0.85
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI error:', err);
      return NextResponse.json({ success: false, message: "API error", score: 50 });
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content?.trim() || "Tell me more about that.";
    
    // Check if interview is ending
    const isEnding = aiMessage.toLowerCase().includes('thank') && 
                     (aiMessage.toLowerCase().includes('time') || aiMessage.toLowerCase().includes('interview'));

    const score = scoreResponse(userMessage);

    return NextResponse.json({ 
      success: true, 
      message: aiMessage, 
      score,
      isEnding
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, message: "Error occurred", score: 50 });
  }
}

function scoreResponse(text: string): number {
  let score = 55;
  const words = text.split(/\s+/).length;
  
  if (words >= 30 && words <= 150) score += 15;
  else if (words >= 15) score += 5;
  else if (words < 10) score -= 10;
  
  if (/because|therefore|for example|specifically/i.test(text)) score += 10;
  if (/um|uh|like,|basically/gi.test(text)) score -= 5;
  
  return Math.min(100, Math.max(20, score));
}
