// Sentence template generator for sentence practice
// Each sentence pair maps specific vocabulary words to natural Chinese-English translations

interface SentenceTemplate {
  chinese: string;           // Natural Chinese sentence
  english: string;           // Natural English translation
  requiredWords: string[];   // Vocabulary words used in the English translation
}

// Pre-made sentence pairs with natural Chinese and English
// The English translation naturally incorporates the required vocabulary words
const sentenceTemplates: SentenceTemplate[] = [
  // Common verbs
  {
    chinese: "我需要完成这个项目",
    english: "I need to complete this project",
    requiredWords: ['complete', 'project'],
  },
  {
    chinese: "请创建一个新文件",
    english: "Please create a new file",
    requiredWords: ['create', 'file'],
  },
  {
    chinese: "她想要学习编程",
    english: "She wants to learn programming",
    requiredWords: ['learn', 'programming'],
  },
  {
    chinese: "我们应该开始工作了",
    english: "We should start working",
    requiredWords: ['start', 'work'],
  },
  {
    chinese: "他正在开发一个应用",
    english: "He is developing an application",
    requiredWords: ['develop', 'application'],
  },
  
  // Technical terms
  {
    chinese: "这个函数返回一个值",
    english: "This function returns a value",
    requiredWords: ['function', 'return', 'value'],
  },
  {
    chinese: "我们需要测试这个功能",
    english: "We need to test this feature",
    requiredWords: ['test', 'feature'],
  },
  {
    chinese: "代码有一个错误",
    english: "The code has an error",
    requiredWords: ['code', 'error'],
  },
  {
    chinese: "请检查这个变量",
    english: "Please check this variable",
    requiredWords: ['check', 'variable'],
  },
  {
    chinese: "这个方法很有用",
    english: "This method is useful",
    requiredWords: ['method', 'useful'],
  },
  
  // Common scenarios
  {
    chinese: "这个场景和之前那个有冲突",
    english: "This scenario conflicts with the previous one",
    requiredWords: ['scenario', 'conflict', 'previous'],
  },
  {
    chinese: "我们需要一个解决方案",
    english: "We need a solution",
    requiredWords: ['need', 'solution'],
  },
  {
    chinese: "这是一个很好的例子",
    english: "This is a good example",
    requiredWords: ['good', 'example'],
  },
  {
    chinese: "请提供更多信息",
    english: "Please provide more information",
    requiredWords: ['provide', 'information'],
  },
  {
    chinese: "这个结果很重要",
    english: "This result is important",
    requiredWords: ['result', 'important'],
  },
  
  // Daily life
  {
    chinese: "今天天气很好",
    english: "The weather is nice today",
    requiredWords: ['weather', 'nice', 'today'],
  },
  {
    chinese: "我想买一本书",
    english: "I want to buy a book",
    requiredWords: ['want', 'buy', 'book'],
  },
  {
    chinese: "他喜欢喝咖啡",
    english: "He likes to drink coffee",
    requiredWords: ['like', 'drink', 'coffee'],
  },
  {
    chinese: "她在读一篇文章",
    english: "She is reading an article",
    requiredWords: ['read', 'article'],
  },
  {
    chinese: "我们需要更多时间",
    english: "We need more time",
    requiredWords: ['need', 'time'],
  },
  
  // Work & study
  {
    chinese: "这个问题很难解决",
    english: "This problem is difficult to solve",
    requiredWords: ['problem', 'difficult', 'solve'],
  },
  {
    chinese: "我正在学习新技能",
    english: "I am learning new skills",
    requiredWords: ['learn', 'skill'],
  },
  {
    chinese: "请仔细阅读文档",
    english: "Please read the document carefully",
    requiredWords: ['read', 'document', 'carefully'],
  },
  {
    chinese: "这个系统运行良好",
    english: "The system runs well",
    requiredWords: ['system', 'run', 'well'],
  },
  {
    chinese: "我们需要改进流程",
    english: "We need to improve the process",
    requiredWords: ['improve', 'process'],
  },
];

export interface GeneratedSentence {
  chinese: string;
  english: string;
  words: string[];
}

/**
 * Find sentence templates that can be practiced with the given vocabulary
 * @param availableWords User's vocabulary words
 * @returns Sentence templates where all required words are in the vocabulary
 */
function findMatchingSentences(availableWords: string[]): SentenceTemplate[] {
  const normalizedVocab = availableWords.map(w => w.toLowerCase());
  
  return sentenceTemplates.filter(template => {
    // Check if all required words for this sentence are in the user's vocabulary
    return template.requiredWords.every(word => 
      normalizedVocab.includes(word.toLowerCase())
    );
  });
}

/**
 * Generate a sentence for practice based on user's vocabulary
 * @param availableWords Array of words in user's vocabulary
 * @returns Generated sentence with Chinese, English, and words to practice, or null if no match
 */
export function generateSentence(availableWords: string[]): GeneratedSentence | null {
  if (availableWords.length === 0) {
    return null;
  }

  // Find all sentences that can be formed with the available vocabulary
  const matchingSentences = findMatchingSentences(availableWords);
  
  if (matchingSentences.length === 0) {
    return null;
  }

  // Randomly select one matching sentence
  const template = matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
  
  // Find the actual words from user's vocabulary (case-sensitive)
  const wordsToUse = template.requiredWords.map(requiredWord => {
    return availableWords.find(w => w.toLowerCase() === requiredWord.toLowerCase()) || requiredWord;
  });

  return {
    chinese: template.chinese,
    english: template.english,
    words: wordsToUse,
  };
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
    
    // Check if the word (or its variations) appears in the translation
    // This accepts: conflict, conflicts, conflicted, conflicting, etc.
    // Use word boundary to avoid false matches (e.g., "conflict" shouldn't match "conflate")
    const found = normalizedTranslation.includes(normalizedWord);
    
    if (!found) {
      missingWords.push(word);
    }
  }

  return {
    success: missingWords.length === 0,
    missingWords,
  };
}
