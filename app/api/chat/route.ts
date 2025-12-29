import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPTS: {[key: string]: string} = {
  technical: `You are an elite finance interviewer at a top-tier firm. Conducting a TECHNICAL interview.
EVALUATE: accuracy, depth, structure, completeness.
RESPOND: If good, brief acknowledgment then deeper follow-up. If incomplete, probe what's missing. If wrong, challenge reasoning.
STYLE: Direct, professional, ONE follow-up at a time, under 50 words.
NEVER give away answers or be mean.`,

  behavioral: `You are conducting a BEHAVIORAL interview using STAR framework.
EVALUATE: Situation clarity, Task specificity, Action (what THEY did), Result (quantified).
RESPOND: If vague, ask for specifics. If missing result, ask for outcomes. If good, brief follow-up.
STYLE: Warm but probing, under 40 words.`,

  stress: `You are conducting a STRESS TEST interview.
BE RAPID: Quick-fire questions, push for immediate answers, challenge if wrong.
STYLE: Fast-paced, slightly aggressive but professional, under 25 words.`,

  'case-study': `You are conducting a CASE STUDY interview.
GUIDE: Let them structure first, probe assumptions, provide data when asked, challenge conclusions.
EVALUATE: Problem structuring, quantitative reasoning, business judgment.
STYLE: Collaborative but challenging, push for specific numbers.`
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [], mode = 'technical', track = 'trading', difficulty = 'analyst', currentQuestion, expectedTopics } = body;

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ success: true, message: getFallbackResponse(mode), score: Math.floor(Math.random() * 30) + 50 });
    }

    let systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.technical;
    if (currentQuestion) systemPrompt += `\n\nCURRENT QUESTION: "${currentQuestion}"`;
    if (expectedTopics?.length) systemPrompt += `\n\nKEY TOPICS TO COVER: ${expectedTopics.join(', ')}`;
    systemPrompt += `\n\nCANDIDATE: ${difficulty.toUpperCase()} level, ${track.toUpperCase()} track`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o', messages, max_tokens: 150, temperature: 0.8 })
    });

    if (!response.ok) {
      return NextResponse.json({ success: true, message: getFallbackResponse(mode), score: Math.floor(Math.random() * 30) + 50 });
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || getFallbackResponse(mode);
    const score = calculateScore(message, expectedTopics);

    return NextResponse.json({ success: true, message: aiMessage, score });
  } catch (error) {
    return NextResponse.json({ success: true, message: "Can you elaborate on that?", score: 50 });
  }
}

function calculateScore(response: string, expectedTopics?: string[]): number {
  let score = 50;
  const words = response.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  if (wordCount >= 50 && wordCount <= 150) score += 15;
  else if (wordCount >= 30 && wordCount <= 200) score += 10;
  else if (wordCount < 20) score -= 10;
  
  if (expectedTopics?.length) {
    const covered = expectedTopics.filter(t => response.toLowerCase().includes(t.toLowerCase())).length;
    score += Math.round((covered / expectedTopics.length) * 25);
  }
  
  const structureWords = ['first', 'second', 'because', 'therefore', 'for example'];
  if (structureWords.some(w => response.toLowerCase().includes(w))) score += 10;
  
  return Math.min(100, Math.max(0, score));
}

function getFallbackResponse(mode: string): string {
  const responses: {[key: string]: string[]} = {
    technical: ["Walk me through the intuition behind that.", "What are the key assumptions?", "How would you hedge that?", "What is the main limitation?"],
    behavioral: ["Can you be more specific about what YOU did?", "What was the measurable outcome?", "How did you handle pushback?"],
    stress: ["Quick, what is 23 times 17?", "Tighten your market.", "You sure about that?"],
    'case-study': ["What assumptions are you making?", "Walk me through the math.", "What are the risks?"]
  };
  const list = responses[mode] || responses.technical;
  return list[Math.floor(Math.random() * list.length)];
}
