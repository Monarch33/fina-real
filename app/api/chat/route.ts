import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      history = [], 
      mode = 'technical', 
      track = 'trading', 
      difficulty = 'analyst', 
      currentQuestion,
      expectedTopics = [],
      questionNumber = 1,
      totalQuestions = 5
    } = body;

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ 
        success: true, 
        message: "Interesting point. Can you elaborate on that?", 
        score: 60 
      });
    }

    // Build a truly conversational system prompt
    const systemPrompt = buildSystemPrompt(mode, track, difficulty, currentQuestion, expectedTopics, questionNumber, totalQuestions);
    
    // Format conversation history properly
    const messages = [
      { role: 'system', content: systemPrompt },
      ...formatHistory(history),
      { role: 'user', content: message }
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
        max_tokens: 200, 
        temperature: 0.85,
        presence_penalty: 0.6,  // Avoid repetition
        frequency_penalty: 0.5  // More variety
      })
    });

    if (!response.ok) {
      console.error('OpenAI error:', await response.text());
      return NextResponse.json({ 
        success: true, 
        message: generateFallback(mode, message), 
        score: 55 
      });
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || generateFallback(mode, message);
    const score = calculateScore(message, expectedTopics);

    return NextResponse.json({ success: true, message: aiMessage, score });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      success: true, 
      message: "That's an interesting perspective. Tell me more about your reasoning.", 
      score: 50 
    });
  }
}

function buildSystemPrompt(
  mode: string, 
  track: string, 
  difficulty: string, 
  currentQuestion: string,
  expectedTopics: string[],
  questionNumber: number,
  totalQuestions: number
): string {
  
  const basePrompt = `You are an expert finance interviewer conducting a ${mode} interview for a ${difficulty}-level ${track} position.

CRITICAL INSTRUCTIONS:
1. You are having a REAL CONVERSATION. Listen carefully to what the candidate just said.
2. RESPOND DIRECTLY to their specific points - reference what they mentioned.
3. NEVER repeat the same question or follow-up twice.
4. Build on their answer - if they mentioned something interesting, dig deeper into THAT specific point.
5. Be natural and conversational, like a real interviewer would be.

CURRENT CONTEXT:
- Question ${questionNumber} of ${totalQuestions}
- Original question asked: "${currentQuestion}"
- Key topics to explore: ${expectedTopics.join(', ')}

YOUR RESPONSE STYLE:
- Start by acknowledging something SPECIFIC from their answer (e.g., "You mentioned X..." or "Interesting point about Y...")
- Then ask a FOLLOW-UP that builds on what they said
- Keep it under 40 words
- Sound natural, not robotic
- If they gave a good answer, challenge them to go deeper
- If they missed something, guide them there

EXAMPLES OF GOOD RESPONSES:
- "You mentioned delta hedging - how often would you rebalance in a high-volatility environment?"
- "Interesting that you focused on the risk side. What about the upside potential?"
- "You said you'd use a straddle. Walk me through the P&L scenarios."

NEVER:
- Repeat the original question
- Give generic responses like "Can you elaborate?"
- Ignore what they just said
- Ask multiple questions at once`;

  // Add mode-specific instructions
  const modeInstructions: {[key: string]: string} = {
    technical: `\n\nTECHNICAL MODE: Push for mathematical precision. If they give a conceptual answer, ask for numbers. If they give numbers, ask about edge cases.`,
    behavioral: `\n\nBEHAVIORAL MODE: Use STAR method. If they're vague, ask "What specifically did YOU do?" If they skip the result, ask "What was the outcome?"`,
    stress: `\n\nSTRESS MODE: Be rapid and direct. Challenge their answers. "Are you sure?" "What if you're wrong?" Push them.`,
    'case-study': `\n\nCASE MODE: Guide them through the problem. Ask about assumptions. Push for specific numbers and calculations.`
  };

  return basePrompt + (modeInstructions[mode] || '');
}

function formatHistory(history: any[]): {role: string, content: string}[] {
  // Take last 10 messages to maintain context without hitting token limits
  return history.slice(-10).map(h => ({
    role: h.role === 'assistant' ? 'assistant' : 'user',
    content: h.content
  }));
}

function calculateScore(response: string, expectedTopics: string[]): number {
  let score = 50;
  const words = response.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Length scoring
  if (wordCount >= 40 && wordCount <= 150) score += 15;
  else if (wordCount >= 25) score += 8;
  else if (wordCount < 15) score -= 10;
  
  // Topic coverage
  if (expectedTopics.length > 0) {
    const covered = expectedTopics.filter(t => 
      response.toLowerCase().includes(t.toLowerCase())
    ).length;
    score += Math.round((covered / expectedTopics.length) * 25);
  }
  
  // Structure indicators
  if (/first|second|because|therefore|specifically|for example|in this case/i.test(response)) {
    score += 10;
  }
  
  // Confidence indicators
  if (/i believe|i think|my approach|i would/i.test(response)) {
    score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

function generateFallback(mode: string, userMessage: string): string {
  // Extract a keyword from user message to make fallback more relevant
  const words = userMessage.toLowerCase().split(/\s+/);
  const keywords = words.filter(w => w.length > 5).slice(0, 2);
  
  const fallbacks: {[key: string]: string[]} = {
    technical: [
      `You touched on an interesting point. How would that change in a stressed market?`,
      `That's one approach. What are the risks you'd be most worried about?`,
      `Walk me through the math on that. What numbers are you assuming?`,
      `How would you hedge that position?`,
      `What's the Greeks exposure look like there?`
    ],
    behavioral: [
      `You mentioned the team. But what was YOUR specific contribution?`,
      `That sounds challenging. How did you measure success?`,
      `What would you do differently if you faced that situation again?`,
      `How did that experience change your approach?`
    ],
    stress: [
      `Quick - what's your confidence level on that?`,
      `And if you're wrong?`,
      `Give me a number.`,
      `Faster. What's your gut say?`
    ],
    'case-study': [
      `What assumptions are driving that conclusion?`,
      `Quantify that for me. What's the expected value?`,
      `What's the biggest risk to your thesis?`,
      `How would you size that position?`
    ]
  };
  
  const options = fallbacks[mode] || fallbacks.technical;
  return options[Math.floor(Math.random() * options.length)];
}
