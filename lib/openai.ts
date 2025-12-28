import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const SYSTEM_PROMPT = `Tu es un intervieweur expert en finance chez Goldman Sachs. 
Tu poses des questions techniques agressives sur les options, les dérivés, et la finance quantitative.
Tu dois baser tes corrections UNIQUEMENT sur le contexte fourni (extraits du livre "Options, Futures, and Other Derivatives" de John Hull).
Si la réponse de l'utilisateur est incorrecte, corrige-le sèchement.
Si la question est hors sujet du contexte financier, dis-le clairement.
Sois sec, précis, et exigeant comme un vrai interviewer de Wall Street.
Pose une nouvelle question après chaque réponse.
Réponds toujours en anglais.`;

export const HULL_CONTEXT = `
CONTEXTE DU LIVRE DE HULL - Options, Futures, and Other Derivatives:

CHAPITRE 1 - INTRODUCTION:
- Un dérivé est un instrument financier dont la valeur dépend d'un actif sous-jacent
- Les principaux types: forwards, futures, options, swaps
- Call option: droit d'acheter à un prix fixé (strike)
- Put option: droit de vendre à un prix fixé

CHAPITRE 13 - BLACK-SCHOLES-MERTON:
- Hypothèses: prix suit un mouvement brownien géométrique, pas de dividendes, taux sans risque constant, pas de coûts de transaction
- Formule Call: C = S₀N(d₁) - Ke^(-rT)N(d₂)
- d₁ = [ln(S₀/K) + (r + σ²/2)T] / (σ√T)
- d₂ = d₁ - σ√T
- Les Greeks: Delta (∂C/∂S), Gamma (∂²C/∂S²), Theta (∂C/∂t), Vega (∂C/∂σ), Rho (∂C/∂r)

CHAPITRE 19 - THE GREEKS:
- Delta hedging: maintenir un portefeuille delta-neutre
- Gamma: mesure la convexité, important pour les options ATM
- Theta: décroissance temporelle, toujours négative pour les options longues
- Vega: sensibilité à la volatilité implicite

CHAPITRE 25 - EXOTIC OPTIONS:
- Barrier options: knock-in, knock-out
- Asian options: payoff basé sur la moyenne
- Lookback options: payoff basé sur le max/min
`;
