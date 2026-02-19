// [ML-MODEL] Simple Heuristic-based Spam Detection
const SPAM_KEYWORDS = ['FREE', 'WINNER', 'URGENT', 'CASH'];

export const analyzeContent = (text: string) => {
  const upperText = text.toUpperCase();
  const triggers = SPAM_KEYWORDS.filter(word => upperText.includes(word));
  
  return {
    isSpam: triggers.length > 0,
    score: triggers.length * 25, // 0-100 scale
    triggers
  };
};