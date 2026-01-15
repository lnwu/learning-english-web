// Sentence template generator for sentence practice
// Supports both pre-made sentence pairs and flexible templates

// Configuration
const FIXED_SENTENCE_PROBABILITY = 0.3; // 30% chance to use fixed sentences when available

interface SentenceTemplate {
  chinese: string;           // Chinese sentence (may contain {word} placeholders)
  english: string;           // English translation (may contain {word} placeholders)
  requiredWords?: string[];  // For fixed sentences: specific words needed
  wordCount?: number;        // For templates: number of words to insert
  type: 'fixed' | 'template'; // Type of sentence
}

// Pre-made sentence pairs for common vocabulary
// These provide high-quality natural sentences for specific words
const fixedSentences: SentenceTemplate[] = [
  {
    type: 'fixed',
    chinese: "这个场景和之前那个有冲突",
    english: "This scenario conflicts with the previous one",
    requiredWords: ['scenario', 'conflict', 'previous'],
  },
  {
    type: 'fixed',
    chinese: "我需要完成这个项目",
    english: "I need to complete this project",
    requiredWords: ['complete', 'project'],
  },
  {
    type: 'fixed',
    chinese: "这个函数返回一个值",
    english: "This function returns a value",
    requiredWords: ['function', 'return', 'value'],
  },
  {
    type: 'fixed',
    chinese: "这个问题很难解决",
    english: "This problem is difficult to solve",
    requiredWords: ['problem', 'difficult', 'solve'],
  },
  {
    type: 'fixed',
    chinese: "我们需要测试这个功能",
    english: "We need to test this feature",
    requiredWords: ['test', 'feature'],
  },
];

// Flexible templates that work with any words
// These use Chinese descriptions/contexts rather than inserting English words directly
const flexibleTemplates: SentenceTemplate[] = [
  // 1-word templates
  {
    type: 'template',
    chinese: "请解释一下「{word1}」的含义",
    english: "Please explain the meaning of {word1}",
    wordCount: 1,
  },
  {
    type: 'template',
    chinese: "我想了解更多关于「{word1}」的信息",
    english: "I want to learn more about {word1}",
    wordCount: 1,
  },
  {
    type: 'template',
    chinese: "「{word1}」是一个重要的概念",
    english: "{word1} is an important concept",
    wordCount: 1,
  },
  
  // 2-word templates
  {
    type: 'template',
    chinese: "「{word1}」和「{word2}」有什么区别",
    english: "What is the difference between {word1} and {word2}",
    wordCount: 2,
  },
  {
    type: 'template',
    chinese: "我们可以使用「{word1}」来实现「{word2}」",
    english: "We can use {word1} to implement {word2}",
    wordCount: 2,
  },
  {
    type: 'template',
    chinese: "「{word1}」通常与「{word2}」一起使用",
    english: "{word1} is usually used together with {word2}",
    wordCount: 2,
  },
  
  // 3-word templates
  {
    type: 'template',
    chinese: "在「{word1}」中，「{word2}」和「{word3}」都很重要",
    english: "In {word1}, both {word2} and {word3} are important",
    wordCount: 3,
  },
  {
    type: 'template',
    chinese: "「{word1}」、「{word2}」和「{word3}」是相关的概念",
    english: "{word1}, {word2} and {word3} are related concepts",
    wordCount: 3,
  },
  {
    type: 'template',
    chinese: "我需要理解「{word1}」、「{word2}」和「{word3}」",
    english: "I need to understand {word1}, {word2} and {word3}",
    wordCount: 3,
  },
  
  // 4-word templates
  {
    type: 'template',
    chinese: "「{word1}」、「{word2}」、「{word3}」和「{word4}」都是关键要素",
    english: "{word1}, {word2}, {word3} and {word4} are all key elements",
    wordCount: 4,
  },
];

export interface GeneratedSentence {
  chinese: string;
  english: string;
  words: string[];
}

/**
 * Find fixed sentences that match user's vocabulary
 */
function findMatchingFixedSentences(availableWords: string[]): SentenceTemplate[] {
  const normalizedVocab = availableWords.map(w => w.toLowerCase());
  
  return fixedSentences.filter(template => {
    const requiredWords = template.requiredWords || [];
    return requiredWords.every(word => 
      normalizedVocab.includes(word.toLowerCase())
    );
  });
}

/**
 * Generate a sentence using flexible templates
 */
function generateFromTemplate(availableWords: string[]): GeneratedSentence | null {
  if (availableWords.length === 0) return null;
  
  // Determine how many words to use (1-4)
  const maxWords = Math.min(4, availableWords.length);
  const minWords = 1;
  const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  
  // Find templates that match this word count
  const matchingTemplates = flexibleTemplates.filter(t => t.wordCount === wordCount);
  
  if (matchingTemplates.length === 0) return null;
  
  // Select a random template
  const template = matchingTemplates[Math.floor(Math.random() * matchingTemplates.length)];
  
  // Shuffle and select words using Fisher-Yates
  const shuffled = [...availableWords];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selectedWords = shuffled.slice(0, wordCount);
  
  // Replace placeholders
  let chinese = template.chinese;
  let english = template.english;
  
  selectedWords.forEach((word, index) => {
    const placeholder = `{word${index + 1}}`;
    chinese = chinese.replace(placeholder, word);
    english = english.replace(placeholder, word);
  });
  
  return {
    chinese,
    english,
    words: selectedWords,
  };
}

/**
 * Generate a sentence for practice based on user's vocabulary
 * Tries fixed sentences first, falls back to templates
 */
export function generateSentence(availableWords: string[]): GeneratedSentence | null {
  if (availableWords.length === 0) {
    return null;
  }

  // Try to find a matching fixed sentence first
  const matchingFixed = findMatchingFixedSentences(availableWords);
  
  if (matchingFixed.length > 0 && Math.random() < FIXED_SENTENCE_PROBABILITY) {
    const template = matchingFixed[Math.floor(Math.random() * matchingFixed.length)];
    const requiredWords = template.requiredWords || [];
    
    // Find the actual words from user's vocabulary (preserve case)
    const wordsToUse = requiredWords.map(requiredWord => {
      return availableWords.find(w => w.toLowerCase() === requiredWord.toLowerCase()) || requiredWord;
    });

    return {
      chinese: template.chinese,
      english: template.english,
      words: wordsToUse,
    };
  }
  
  // Use flexible templates for any vocabulary
  return generateFromTemplate(availableWords);
}

/**
 * Check if user's translation contains all required words
 * Accepts word variations (plurals, conjugations, etc.)
 * @param translation User's English translation
 * @param requiredWords Words that should be in the translation
 * @returns Object with success status and missing words
 */
export function checkTranslation(
  translation: string,
  requiredWords: string[]
): { success: boolean; missingWords: string[] } {
  const normalizedTranslation = translation.toLowerCase().trim();
  const missingWords: string[] = [];

  for (const word of requiredWords) {
    const normalizedWord = word.toLowerCase();
    
    // Use word boundary regex to avoid false positives
    // Escape special regex characters including hyphen
    const escapedWord = normalizedWord.replace(/[.*+?^${}()|[\]\\/\-]/g, '\\$&');
    const pattern = new RegExp('\\b' + escapedWord, 'i');
    
    if (!pattern.test(normalizedTranslation)) {
      missingWords.push(word);
    }
  }

  return {
    success: missingWords.length === 0,
    missingWords,
  };
}
