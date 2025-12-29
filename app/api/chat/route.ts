import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message,  // What the user just said
      conversationHistory = [],  // Full conversation so far
      mode = 'technical', 
      track = 'trading', 
      difficulty = 'analyst',
      questionNumber = 1,
      totalQuestions = 5
    } = body;

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ 
        success: true, 
        message: "Interesting. Tell me more about that.", 
        score: 60,
        shouldMoveOn: false
      });
    }

    const systemPrompt = `You are a senior interviewer at a top finance firm (Jane Street/Citadel level) conducting a ${mode} interview.

THE CANDIDATE JUST SAID: "${message}"

YOUR JOB:
1. DIRECTLY RESPOND to what they said - quote their words back to them
2. If they made a good point: "You mentioned [X], that's interesting because..." then probe deeper
3. If they made an error: "You said [X], but actually..." then correct gently and ask them to reconsider
4. If they were vague: "You said [X] - can you be more specific about..."
5. If they seem confused: Explain briefly, then ask a simpler related question

RULES:
- NEVER ignore what they said
- ALWAYS reference something specific from their answer
- Ask ONE follow-up question maximum
- Keep response under 50 words
- Be conversational, not robotic
- Sound like a real person talking

CONVERSATION SO FAR:
${conversationHistory.map((h: any) => `${h.role === 'assistant' ? 'INTERVIEWER' : 'CANDIDATE'}: ${h.content}`).join('\n')}

MODE: ${mode.toUpperCase()}
${mode === 'technical' ? '- Push for precision and numbers' : ''}
${mode === 'behavioral' ? '- Look for specific examples and outcomes' : ''}
${mode === 'stress' ? '- Be direct and challenge them' : ''}

After 2-3 exchanges on a topic, you can transition to a new question by saying something like "Good, let's move on. [new question]"

Respond naturally as if you're having a real conversation:`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `The candidate said: "${message}"\n\nRespond directly to what they said:` }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${OPENAI_API_KEY}` 
      },
      body: JSON.stringify({ 
        model: 'gpt-4o', 
        messages, 
        max_tokens: 150, 
        temperature: 0.9,
        presence_penalty: 0.8,
        frequency_penalty: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error:', errText);
      return NextResponse.json({ 
        success: true, 
        message: `You mentioned "${message.split(' ').slice(0, 5).join(' ')}..." - can you expand on that?`, 
        score: 55,
        shouldMoveOn: false
      });
    }

    const data = await response.json();
    let aiMessage = data.choices[0]?.message?.content || "";
    
    // Clean up the response
    aiMessage = aiMessage.replace(/^(Interviewer:|AI:|Response:)/i, '').trim();
    
    const score = calculateScore(message);
    const shouldMoveOn = aiMessage.toLowerCase().includes("let's move on") || 
                         aiMessage.toLowerCase().includes("next question") ||
                         aiMessage.toLowerCase().includes("moving on");

    return NextResponse.json({ 
      success: true, 
      message: aiMessage, 
      score,
      shouldMoveOn
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      success: true, 
      message: "That's a fair point. What led you to that conclusion?", 
      score: 50,
      shouldMoveOn: false
    });
  }
}

function calculateScore(response: string): number {
  let score = 55;
  const words = response.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  if (wordCount >= 30 && wordCount <= 150) score += 15;
  else if (wordCount >= 20) score += 8;
  else if (wordCount < 10) score -= 15;
  
  if (/because|therefore|specifically|for example|first|second/i.test(response)) score += 10;
  if (/i think|i believe|my view|i would/i.test(response)) score += 5;
  if (/um|uh|like|basically|you know/gi.test(response)) score -= 5;
  
  return Math.min(100, Math.max(0, score));
}
