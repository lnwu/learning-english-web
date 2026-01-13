// Sentence template generator for sentence practice

interface SentenceTemplate {
  chinese: string;
  english: string;
  wordTypes: string[]; // Types of words needed (e.g., ['verb', 'noun', 'adjective'])
}

// Simple sentence templates that work with any word
const templates: SentenceTemplate[] = [
  {
    chinese: "我喜欢{word1}和{word2}",
    english: "I like {word1} and {word2}",
    wordTypes: ['any', 'any'],
  },
  {
    chinese: "这个{word1}非常{word2}",
    english: "This {word1} is very {word2}",
    wordTypes: ['any', 'any'],
  },
  {
    chinese: "我看到一个{word1}",
    english: "I see a {word1}",
    wordTypes: ['any'],
  },
  {
    chinese: "我想要{word1}",
    english: "I want {word1}",
    wordTypes: ['any'],
  },
  {
    chinese: "{word1}很{word2}",
    english: "The {word1} is {word2}",
    wordTypes: ['any', 'any'],
  },
  {
    chinese: "我有一个{word1}",
    english: "I have a {word1}",
    wordTypes: ['any'],
  },
  {
    chinese: "这是我的{word1}",
    english: "This is my {word1}",
    wordTypes: ['any'],
  },
  {
    chinese: "我需要{word1}和{word2}",
    english: "I need {word1} and {word2}",
    wordTypes: ['any', 'any'],
  },
  {
    chinese: "我能看见{word1}",
    english: "I can see the {word1}",
    wordTypes: ['any'],
  },
  {
    chinese: "那个{word1}在{word2}旁边",
    english: "The {word1} is next to the {word2}",
    wordTypes: ['any', 'any'],
  },
  {
    chinese: "我们有{word1}、{word2}和{word3}",
    english: "We have {word1}, {word2} and {word3}",
    wordTypes: ['any', 'any', 'any'],
  },
  {
    chinese: "他喜欢{word1}但不喜欢{word2}",
    english: "He likes {word1} but not {word2}",
    wordTypes: ['any', 'any'],
  },
  {
    chinese: "她有一个{word1}",
    english: "She has a {word1}",
    wordTypes: ['any'],
  },
  {
    chinese: "这是一个很{word1}的{word2}",
    english: "This is a very {word1} {word2}",
    wordTypes: ['any', 'any'],
  },
  {
    chinese: "我们找到了{word1}",
    english: "We found the {word1}",
    wordTypes: ['any'],
  },
  {
    chinese: "他们有{word1}和{word2}",
    english: "They have {word1} and {word2}",
    wordTypes: ['any', 'any'],
  },
  {
    chinese: "我的{word1}比你的{word2}更好",
    english: "My {word1} is better than your {word2}",
    wordTypes: ['any', 'any'],
  },
  {
    chinese: "你能看见那个{word1}吗",
    english: "Can you see that {word1}",
    wordTypes: ['any'],
  },
  {
    chinese: "我正在寻找{word1}",
    english: "I am looking for the {word1}",
    wordTypes: ['any'],
  },
  {
    chinese: "这些{word1}和{word2}都很好",
    english: "These {word1} and {word2} are all good",
    wordTypes: ['any', 'any'],
  },
  {
    chinese: "我们需要一个{word1}、一个{word2}和一个{word3}",
    english: "We need a {word1}, a {word2} and a {word3}",
    wordTypes: ['any', 'any', 'any'],
  },
  {
    chinese: "她想要{word1}、{word2}、{word3}和{word4}",
    english: "She wants {word1}, {word2}, {word3} and {word4}",
    wordTypes: ['any', 'any', 'any', 'any'],
  },
  {
    chinese: "我买了{word1}、{word2}、{word3}、{word4}和{word5}",
    english: "I bought {word1}, {word2}, {word3}, {word4} and {word5}",
    wordTypes: ['any', 'any', 'any', 'any', 'any'],
  },
];

export interface GeneratedSentence {
  chinese: string;
  english: string;
  words: string[];
}

/**
 * Generate a sentence using random words from the vocabulary
 * @param words Array of available words
 * @param count Number of words to use (3-5)
 * @returns Generated sentence with Chinese, English, and words used
 */
export function generateSentence(words: string[], count: number = 3): GeneratedSentence | null {
  if (words.length < count) {
    return null;
  }

  // Filter templates that match the word count
  const matchingTemplates = templates.filter(t => t.wordTypes.length === count);
  
  if (matchingTemplates.length === 0) {
    return null;
  }

  // Select a random template
  const template = matchingTemplates[Math.floor(Math.random() * matchingTemplates.length)];

  // Shuffle and select random words
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  const selectedWords = shuffled.slice(0, count);

  // Replace placeholders with words
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
 * Check if user's translation contains all required words
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
    // Check if the word appears as a whole word (not as part of another word)
    const wordRegex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
    if (!wordRegex.test(normalizedTranslation)) {
      missingWords.push(word);
    }
  }

  return {
    success: missingWords.length === 0,
    missingWords,
  };
}
