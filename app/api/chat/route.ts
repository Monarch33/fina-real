import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message,
      conversationHistory = [],
      mode = 'technical', 
      questionNumber = 1
    } = body;

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ 
        success: true, 
        message: "That's a solid point. Let's move on - tell me about a time you worked under pressure.", 
        score: 60,
        action: 'continue'
      });
    }

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-8)
      .map((h: any) => `${h.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${h.content}`)
      .join('\n');

    const systemPrompt = `You are a senior finance interviewer at Jane Street conducting a ${mode} interview.

You are having a natural conversation. The candidate just responded to your question.

CONVERSATION SO FAR:
${conversationContext}

CANDIDATE'S LATEST RESPONSE:
"${message}"

YOUR TASK:
Respond like a real interviewer would. You have 3 options:

OPTION A - FEEDBACK + FOLLOW-UP (if their answer needs clarification or was incomplete):
Give brief feedback on what was good/missing, then ask ONE specific follow-up question.
Example: "Good point about delta hedging. But you didn't mention gamma - how does gamma exposure affect your hedging frequency?"

OPTION B - ACKNOWLEDGE + NEW TOPIC (if their answer was satisfactory):
Briefly acknowledge their answer, then move to a completely new question.
Example: "That's a solid explanation. Let's switch gears - walk me through how you'd value a company using DCF."

OPTION C - WRAP UP (if you've covered enough after ${questionNumber}+ exchanges):
Thank them and end the interview naturally.
Example: "Great, I think I have a good sense of your background. Thanks for your time today. Do you have any questions for me?"

RULES:
- Be natural and conversational, NOT robotic
- NEVER repeat the same question
- NEVER just quote their words back ("you mentioned X...")
- Give real feedback if they made errors
- Keep responses under 40 words
- Act like a real human interviewer

Respond now:`;

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
          { role: 'user', content: 'Respond as the interviewer:' }
        ], 
        max_tokens: 120, 
        temperature: 0.8,
        presence_penalty: 0.6,
        frequency_penalty: 0.5
      })
    });

    if (!response.ok) {
      console.error('OpenAI error');
      return NextResponse.json({ 
        success: true, 
        message: "Good. Now tell me - what's your biggest weakness and how do you manage it?", 
        score: 55,
        action: 'continue'
      });
    }

    const data = await response.json();
    let aiMessage = data.choices[0]?.message?.content || "";
    aiMessage = aiMessage.replace(/^(Interviewer:|Response:)/gi, '').trim();
    
    // Determine action based on response content
    let action = 'continue';
    if (aiMessage.toLowerCase().includes('thank') && aiMessage.toLowerCase().includes('time')) {
      action = 'end';
    } else if (aiMessage.includes('?')) {
      action = 'question';
    }

    const score = calculateScore(message);

    return NextResponse.json({ 
      success: true, 
      message: aiMessage, 
      score,
      action
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      success: true, 
      message: "Interesting. Now, tell me about a challenging project you worked on.", 
      score: 50,
      action: 'continue'
    });
  }
}

function calculateScore(response: string): number {
  let score = 55;
  const words = response.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  if (wordCount >= 30 && wordCount <= 120) score += 15;
  else if (wordCount >= 20) score += 8;
  else if (wordCount < 10) score -= 15;
  
  if (/because|therefore|specifically|for example|first|second|the reason/i.test(response)) score += 10;
  if (/i led|i managed|i built|i created|i achieved|resulted in/i.test(response)) score += 8;
  if (/um|uh|like,|basically|you know|i guess/gi.test(response)) score -= 5;
  
  return Math.min(100, Math.max(20, score));
}
