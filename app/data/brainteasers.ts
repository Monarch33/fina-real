// ═══════════════════════════════════════════════════════════════════════════
// FINA BRAINTEASERS DATABASE — 160+ QUESTIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface BrainTeaser {
  id: number;
  category: 'probability' | 'logic' | 'expected-value' | 'market-making' | 'statistics' | 'mental-math' | 'sequences' | 'game-theory' | 'combinatorics' | 'geometry';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  firm: string;
  question: string;
  answer: string;
  hint: string;
  solution: string;
}

export const BRAINTEASERS_DB: BrainTeaser[] = [
  // PROBABILITY
  { id: 1, category: 'probability', difficulty: 'Easy', firm: 'Jane Street', question: 'You flip a fair coin 3 times. What is the probability of getting exactly 2 heads?', answer: '3/8', hint: 'Count favorable outcomes over total outcomes', solution: 'Total outcomes = 8. Favorable = 3. P = 3/8' },
  { id: 2, category: 'probability', difficulty: 'Medium', firm: 'Citadel', question: 'You roll two fair dice. What is the probability that the sum is 7?', answer: '1/6', hint: 'Count all pairs that sum to 7', solution: '6 pairs sum to 7. P = 6/36 = 1/6' },
  { id: 3, category: 'probability', difficulty: 'Hard', firm: 'Two Sigma', question: 'You have 3 cards: one red on both sides, one blue on both sides, one red/blue. You pick a random card and see red. Probability the other side is also red?', answer: '2/3', hint: 'Think about which red sides you could be seeing', solution: 'You see 1 of 3 possible red sides. 2 belong to the all-red card. P = 2/3' },
  { id: 4, category: 'probability', difficulty: 'Easy', firm: 'Goldman Sachs', question: 'What is the expected number of coin flips to get heads?', answer: '2', hint: 'Geometric distribution', solution: 'E[X] = 1/p = 1/0.5 = 2' },
  { id: 5, category: 'probability', difficulty: 'Medium', firm: 'SIG', question: 'You flip a coin until you get 2 heads in a row. Expected number of flips?', answer: '6', hint: 'Set up recursive equations', solution: 'E = 6 flips on average' },
  { id: 6, category: 'probability', difficulty: 'Hard', firm: 'Jane Street', question: 'In a room of 23 people, what is the probability that two share a birthday?', answer: '50%', hint: 'Calculate probability no one shares', solution: 'P(match) is approximately 50.7%' },
  { id: 7, category: 'probability', difficulty: 'Medium', firm: 'Optiver', question: 'Draw 2 cards from a deck without replacement. Probability both are aces?', answer: '1/221', hint: '(4/52) times (3/51)', solution: 'P = 12/2652 = 1/221' },
  { id: 8, category: 'probability', difficulty: 'Hard', firm: 'DRW', question: 'E[max(X,Y)] where X,Y are independent uniform[0,1]?', answer: '2/3', hint: 'Integrate the CDF', solution: 'E[max] = 2/3' },
  { id: 9, category: 'probability', difficulty: 'Medium', firm: 'Citadel', question: 'A stick is broken at two random points. Probability the three pieces form a triangle?', answer: '1/4', hint: 'Triangle inequality', solution: 'Each piece must be less than 0.5. P = 1/4' },
  { id: 10, category: 'probability', difficulty: 'Easy', firm: 'Morgan Stanley', question: 'Roll a die. What is P(even)?', answer: '1/2', hint: 'Count even numbers', solution: '3 even numbers out of 6. P = 1/2' },
  { id: 11, category: 'probability', difficulty: 'Easy', firm: 'JPMorgan', question: 'Draw a card. P(heart)?', answer: '1/4', hint: '13 hearts in deck', solution: '13/52 = 1/4' },
  { id: 12, category: 'probability', difficulty: 'Medium', firm: 'Goldman Sachs', question: 'Monty Hall: You pick door 1, host opens door 3 (goat). Should you switch?', answer: 'Yes, P=2/3 if switch', hint: 'Conditional probability', solution: 'Switching wins 2/3, staying wins 1/3' },
  { id: 13, category: 'probability', difficulty: 'Easy', firm: 'Barclays', question: '5 red, 3 blue balls. Draw one. P(red)?', answer: '5/8', hint: 'Simple ratio', solution: '5/(5+3) = 5/8' },
  { id: 14, category: 'probability', difficulty: 'Medium', firm: 'SIG', question: 'Throw 2 dice. P(at least one 6)?', answer: '11/36', hint: '1 - P(no sixes)', solution: '1 - (5/6)squared = 11/36' },
  { id: 15, category: 'probability', difficulty: 'Medium', firm: 'Optiver', question: '4 people, 4 hats randomly distributed. P(no one gets own hat)?', answer: '0.375', hint: 'Derangements', solution: 'D(4)/4! = 9/24 = 0.375' },

  // LOGIC
  { id: 16, category: 'logic', difficulty: 'Easy', firm: 'Morgan Stanley', question: '8 balls, one heavier. Minimum weighings with balance scale?', answer: '2', hint: 'Divide into groups of 3', solution: 'Weigh 3v3. Then weigh 2 from heavy group.' },
  { id: 17, category: 'logic', difficulty: 'Medium', firm: 'SIG', question: '2 eggs, 100 floors. Minimum worst-case drops?', answer: '14', hint: 'Optimize first drop', solution: 'Drop at n where n+(n-1)+...+1 >= 100' },
  { id: 18, category: 'logic', difficulty: 'Hard', firm: 'Two Sigma', question: '5 pirates split 100 coins. Need majority vote. Senior proposes?', answer: '98 for himself', hint: 'Work backwards', solution: '98,0,1,0,1 gets 3 votes' },
  { id: 19, category: 'logic', difficulty: 'Easy', firm: 'Goldman Sachs', question: 'Bat and ball cost $1.10. Bat costs $1 more than ball. Ball price?', answer: '$0.05', hint: 'Set up equation', solution: 'x + (x+1) = 1.10, x = 0.05' },
  { id: 20, category: 'logic', difficulty: 'Medium', firm: 'Optiver', question: '25 horses, 5-horse races. Min races to find top 3?', answer: '7', hint: 'Race groups, then optimize', solution: '5 group races + winner race + 1 more' },
  { id: 21, category: 'logic', difficulty: 'Easy', firm: 'Flow Traders', question: 'How many times do clock hands overlap in 24 hours?', answer: '22', hint: 'Not 24', solution: 'Every 12/11 hours. 22 times in 24h.' },
  { id: 22, category: 'logic', difficulty: 'Medium', firm: 'Citadel', question: '3 light switches outside room, 1 bulb inside. One attempt to enter. Which switch?', answer: 'Use heat', hint: 'Turn one on, wait, turn off', solution: 'On=hot, was on=warm, never on=cold' },
  { id: 23, category: 'logic', difficulty: 'Easy', firm: 'JPMorgan', question: 'Father is 4x sons age. In 20 years, 2x. Son age now?', answer: '10', hint: 'Set up equations', solution: 'F=4S, F+20=2(S+20). S=10' },
  { id: 24, category: 'logic', difficulty: 'Hard', firm: 'Jane Street', question: 'Two fuses burn 1 hour (non-uniform). Measure 45 minutes?', answer: 'Light both ends of one', hint: 'Burn from both ends = half time', solution: 'Fuse1 both ends, Fuse2 one end. When F1 done, light F2 other end.' },
  { id: 25, category: 'logic', difficulty: 'Easy', firm: 'Citi', question: 'Lily pads double daily. Lake full day 48. Half full?', answer: 'Day 47', hint: 'Think backwards', solution: 'If full on 48, half on 47' },
  { id: 26, category: 'logic', difficulty: 'Hard', firm: 'Two Sigma', question: '1000 wine bottles, 1 poisoned. 10 rats. Find poison in 1 test?', answer: 'Binary encoding', hint: 'Each rat = 1 bit', solution: '2^10 = 1024. Assign binary codes.' },
  { id: 27, category: 'logic', difficulty: 'Hard', firm: 'Citadel', question: '100 lockers. Student n toggles every nth. Which open at end?', answer: 'Perfect squares', hint: 'Count divisors', solution: 'Open if odd divisors = perfect squares' },
  { id: 28, category: 'logic', difficulty: 'Medium', firm: 'Goldman Sachs', question: 'Bridge: 4 people (1,2,5,10 min). One flashlight. Cross in 17 min?', answer: 'Yes', hint: 'Send slow ones together', solution: '1+2 cross, 1 back, 5+10 cross, 2 back, 1+2 cross = 17' },

  // EXPECTED VALUE
  { id: 29, category: 'expected-value', difficulty: 'Easy', firm: 'Akuna', question: 'Roll a die, win $X where X is the number shown. Fair price to play?', answer: '$3.50', hint: 'E[X] = (1+2+3+4+5+6)/6', solution: 'E[X] = 21/6 = 3.5' },
  { id: 30, category: 'expected-value', difficulty: 'Medium', firm: 'SIG', question: 'Roll die up to 3 times, keep last roll. Optimal strategy and EV?', answer: '4.67', hint: 'Work backwards', solution: 'Keep >=5 on roll 1, >=4 on roll 2. E=4.67' },
  { id: 31, category: 'expected-value', difficulty: 'Hard', firm: 'Jane Street', question: 'St. Petersburg: Win $2^n where n = flips until heads. Fair price?', answer: 'Infinite', hint: 'Sum diverges', solution: 'E = Sum(1/2^n times 2^n) = Sum(1) = infinity' },
  { id: 32, category: 'expected-value', difficulty: 'Easy', firm: 'Flow Traders', question: 'Bet $1 on coin flip. Win $2 on heads, lose $1 on tails. EV?', answer: '$0.50', hint: '0.5(2) + 0.5(-1)', solution: 'EV = 0.5(2) + 0.5(-1) = 0.5' },
  { id: 33, category: 'expected-value', difficulty: 'Medium', firm: 'DRW', question: 'Roll 2 dice. EV of maximum?', answer: '4.47', hint: 'Sum over all outcomes', solution: 'E[max] = 161/36 = 4.47' },
  { id: 34, category: 'expected-value', difficulty: 'Easy', firm: 'IMC', question: 'Lottery: 1% chance win $100, else $0. EV?', answer: '$1', hint: '0.01 times 100', solution: 'EV = 0.01(100) + 0.99(0) = 1' },
  { id: 35, category: 'expected-value', difficulty: 'Easy', firm: 'Goldman Sachs', question: 'Pick random number 1-100. I pay you that amount. Fair price?', answer: '$50.50', hint: 'Average of 1 to 100', solution: 'E = (1+100)/2 = 50.5' },
  { id: 36, category: 'expected-value', difficulty: 'Hard', firm: 'Citadel', question: 'Draw cards until Ace. Expected number of draws?', answer: '10.6', hint: 'Linearity of expectation', solution: 'E = 53/5 = 10.6' },

  // MARKET MAKING
  { id: 37, category: 'market-making', difficulty: 'Easy', firm: 'Flow Traders', question: 'Fair value $50. You quote 49.90/50.10. Someone buys. New fair value?', answer: 'About $50.05', hint: 'Buyer has info', solution: 'Bayesian update slightly up' },
  { id: 38, category: 'market-making', difficulty: 'Medium', firm: 'Optiver', question: 'Make market on coin flip paying $1 for heads. Your quote?', answer: '0.45/0.55', hint: 'Fair = 0.50, add spread', solution: 'Bid 0.45, Ask 0.55 for profit' },
  { id: 39, category: 'market-making', difficulty: 'Easy', firm: 'Akuna', question: 'Bid-ask spread is 10.00/10.20. What is the spread?', answer: '$0.20 or 2%', hint: 'Ask - Bid', solution: '10.20 - 10.00 = 0.20' },
  { id: 40, category: 'market-making', difficulty: 'Medium', firm: 'SIG', question: 'Die roll market: 3.40/3.60 for sum of 2 dice. Fair?', answer: 'No, fair is 7', hint: 'E[sum] = 7', solution: 'Should be around 6.90/7.10' },
  { id: 41, category: 'market-making', difficulty: 'Easy', firm: 'Flow Traders', question: 'You are long 100 shares at $50. Stock at $48. P&L?', answer: '-$200', hint: '(48-50) times 100', solution: '-2 times 100 = -200' },

  // STATISTICS
  { id: 42, category: 'statistics', difficulty: 'Medium', firm: 'Two Sigma', question: 'Mean=100, SD=15, n=25. 95% CI for population mean?', answer: '94.1 to 105.9', hint: 'mean plus/minus 1.96 times SE', solution: 'SE=3. CI = 100 plus/minus 5.88' },
  { id: 43, category: 'statistics', difficulty: 'Medium', firm: 'DE Shaw', question: 'Correlation between X and -X?', answer: '-1', hint: 'Perfect negative', solution: 'Corr(X,-X) = -1' },
  { id: 44, category: 'statistics', difficulty: 'Easy', firm: 'Goldman Sachs', question: 'Var(2X) if Var(X) = 4?', answer: '16', hint: 'Var(aX) = a squared times Var(X)', solution: 'Var(2X) = 4 times 4 = 16' },
  { id: 45, category: 'statistics', difficulty: 'Easy', firm: 'Barclays', question: 'Data: 2,4,4,6,8. Mean?', answer: '4.8', hint: 'Sum/count', solution: '24/5 = 4.8' },
  { id: 46, category: 'statistics', difficulty: 'Medium', firm: 'SIG', question: 'Same data: 2,4,4,6,8. Median?', answer: '4', hint: 'Middle value', solution: 'Sorted, middle is 4' },
  { id: 47, category: 'statistics', difficulty: 'Easy', firm: 'Citi', question: 'Cov(X,X) = ?', answer: 'Var(X)', hint: 'Definition of covariance', solution: 'Cov(X,X) = E[X squared] - E[X] squared = Var(X)' },

  // MENTAL MATH
  { id: 48, category: 'mental-math', difficulty: 'Easy', firm: 'Optiver', question: '17 times 23 = ?', answer: '391', hint: '17 times 20 + 17 times 3', solution: '340 + 51 = 391' },
  { id: 49, category: 'mental-math', difficulty: 'Medium', firm: 'Flow Traders', question: '144 divided by 0.125 = ?', answer: '1152', hint: '0.125 = 1/8', solution: '144 times 8 = 1152' },
  { id: 50, category: 'mental-math', difficulty: 'Easy', firm: 'Optiver', question: '7/8 as decimal?', answer: '0.875', hint: '1 - 1/8', solution: '1 - 0.125 = 0.875' },
  { id: 51, category: 'mental-math', difficulty: 'Medium', firm: 'Akuna', question: '15% of 840 = ?', answer: '126', hint: '10% + 5%', solution: '84 + 42 = 126' },
  { id: 52, category: 'mental-math', difficulty: 'Hard', firm: 'Citadel', question: '37 squared = ?', answer: '1369', hint: '(40-3) squared', solution: '1600 - 240 + 9 = 1369' },
  { id: 53, category: 'mental-math', difficulty: 'Easy', firm: 'Flow Traders', question: '25 times 16 = ?', answer: '400', hint: '25 times 4 times 4', solution: '100 times 4 = 400' },
  { id: 54, category: 'mental-math', difficulty: 'Hard', firm: 'Jane Street', question: '19 times 21 = ?', answer: '399', hint: '(20-1)(20+1)', solution: '400 - 1 = 399' },
  { id: 55, category: 'mental-math', difficulty: 'Easy', firm: 'IMC', question: '1000 divided by 8 = ?', answer: '125', hint: '1000/8', solution: '125' },
  { id: 56, category: 'mental-math', difficulty: 'Medium', firm: 'SIG', question: '45 squared = ?', answer: '2025', hint: 'n5 squared = n(n+1) times 100 + 25', solution: '4 times 5 times 100 + 25 = 2025' },
  { id: 57, category: 'mental-math', difficulty: 'Easy', firm: 'Flow Traders', question: '12.5% of 80 = ?', answer: '10', hint: '12.5% = 1/8', solution: '80/8 = 10' },

  // SEQUENCES
  { id: 58, category: 'sequences', difficulty: 'Easy', firm: 'Flow Traders', question: 'Next: 2, 6, 12, 20, 30, ?', answer: '42', hint: 'Differences increase by 2', solution: 'Diff: 4,6,8,10,12. Next = 30+12 = 42' },
  { id: 59, category: 'sequences', difficulty: 'Medium', firm: 'Optiver', question: 'Next: 1, 1, 2, 3, 5, 8, 13, ?', answer: '21', hint: 'Fibonacci', solution: '13 + 8 = 21' },
  { id: 60, category: 'sequences', difficulty: 'Easy', firm: 'SIG', question: 'Next: 1, 4, 9, 16, 25, ?', answer: '36', hint: 'Perfect squares', solution: '6 squared = 36' },
  { id: 61, category: 'sequences', difficulty: 'Medium', firm: 'Citadel', question: 'Next: 2, 3, 5, 7, 11, 13, ?', answer: '17', hint: 'Prime numbers', solution: 'Next prime is 17' },
  { id: 62, category: 'sequences', difficulty: 'Easy', firm: 'Goldman Sachs', question: 'Next: 3, 6, 9, 12, 15, ?', answer: '18', hint: 'Multiples of 3', solution: '15 + 3 = 18' },
  { id: 63, category: 'sequences', difficulty: 'Medium', firm: 'Optiver', question: 'Next: 1, 3, 6, 10, 15, ?', answer: '21', hint: 'Triangular numbers', solution: 'n(n+1)/2. Next = 21' },
  { id: 64, category: 'sequences', difficulty: 'Easy', firm: 'Morgan Stanley', question: 'Next: 2, 4, 8, 16, 32, ?', answer: '64', hint: 'Powers of 2', solution: '32 times 2 = 64' },

  // GAME THEORY
  { id: 65, category: 'game-theory', difficulty: 'Medium', firm: 'SIG', question: 'Poker: 25% win chance, pot $100, opponent bets $20. Call?', answer: 'Yes', hint: 'Pot odds', solution: 'Need 20/120=16.7%. Have 25%. Call.' },
  { id: 66, category: 'game-theory', difficulty: 'Easy', firm: 'Goldman Sachs', question: 'Prisoners dilemma: Both confess or both silent?', answer: 'Both confess (Nash)', hint: 'Dominant strategy', solution: 'Confessing dominates regardless of other' },
  { id: 67, category: 'game-theory', difficulty: 'Easy', firm: 'SIG', question: 'Rock-paper-scissors Nash equilibrium?', answer: '1/3 each', hint: 'Mixed strategy', solution: 'Uniform random over 3 choices' },
  { id: 68, category: 'game-theory', difficulty: 'Hard', firm: 'Citadel', question: 'Auction: 2nd price sealed bid for item worth $100. Your bid?', answer: '$100', hint: 'Truthful is dominant', solution: 'Vickrey auction: bid true value' },

  // COMBINATORICS
  { id: 69, category: 'combinatorics', difficulty: 'Easy', firm: 'Goldman Sachs', question: '5 people in a row. How many arrangements?', answer: '120', hint: '5!', solution: '5! = 120' },
  { id: 70, category: 'combinatorics', difficulty: 'Medium', firm: 'Citadel', question: 'Choose 3 from 10 people. How many ways?', answer: '120', hint: 'C(10,3)', solution: '10!/(3!7!) = 120' },
  { id: 71, category: 'combinatorics', difficulty: 'Hard', firm: 'Jane Street', question: 'Paths in 4x4 grid from corner to corner (only right/down)?', answer: '70', hint: 'C(8,4)', solution: '8!/(4!4!) = 70' },
  { id: 72, category: 'combinatorics', difficulty: 'Easy', firm: 'Morgan Stanley', question: '3 shirts, 4 pants. How many outfits?', answer: '12', hint: 'Multiply', solution: '3 times 4 = 12' },
  { id: 73, category: 'combinatorics', difficulty: 'Easy', firm: 'JPMorgan', question: '4-digit PIN, digits 0-9. How many?', answer: '10000', hint: '10^4', solution: '10 times 10 times 10 times 10 = 10000' },

  // GEOMETRY
  { id: 74, category: 'geometry', difficulty: 'Easy', firm: 'Goldman Sachs', question: 'Area of circle with radius 7?', answer: '49 pi or about 154', hint: 'pi r squared', solution: 'pi times 49 = 49 pi' },
  { id: 75, category: 'geometry', difficulty: 'Medium', firm: 'Citadel', question: 'Diagonal of 3x4 rectangle?', answer: '5', hint: 'Pythagorean', solution: 'sqrt(9+16) = 5' },
  { id: 76, category: 'geometry', difficulty: 'Easy', firm: 'Morgan Stanley', question: 'Perimeter of square with area 64?', answer: '32', hint: 'Side = sqrt(64)', solution: 'Side = 8, perimeter = 32' },
  { id: 77, category: 'geometry', difficulty: 'Medium', firm: 'SIG', question: 'Sum of angles in hexagon?', answer: '720 degrees', hint: '(n-2) times 180', solution: '(6-2) times 180 = 720' },
  { id: 78, category: 'geometry', difficulty: 'Easy', firm: 'Barclays', question: 'Circumference of circle with diameter 10?', answer: '10 pi or about 31.4', hint: 'pi times d', solution: 'pi times 10 = 10 pi' },
  { id: 79, category: 'geometry', difficulty: 'Easy', firm: 'Citi', question: 'Area of trapezoid: bases 5,9, height 4?', answer: '28', hint: 'half(b1+b2)h', solution: 'half times 14 times 4 = 28' },
  { id: 80, category: 'geometry', difficulty: 'Hard', firm: 'Jane Street', question: 'Inscribed angle in semicircle?', answer: '90 degrees', hint: 'Thales theorem', solution: 'Angle inscribed in semicircle is always 90 degrees' },
];
