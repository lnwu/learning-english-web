# API Documentation

This document provides detailed information about the external APIs used in the Learning English application.

## Table of Contents

- [Dictionary API](#dictionary-api)
- [Translation API](#translation-api)
- [Fallback Mechanism](#fallback-mechanism)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)

## Dictionary API

### Overview

The application uses the [Free Dictionary API](https://dictionaryapi.dev/) to validate English words and fetch their definitions.

### Endpoint

```
GET https://api.dictionaryapi.dev/api/v2/entries/en/{word}
```

### Request Example

```typescript
const response = await fetch(
  `https://api.dictionaryapi.dev/api/v2/entries/en/hello`
);
const data = await response.json();
```

### Response Format

```json
[
  {
    "word": "hello",
    "phonetic": "/həˈloʊ/",
    "phonetics": [...],
    "meanings": [
      {
        "partOfSpeech": "noun",
        "definitions": [
          {
            "definition": "Used as a greeting or to begin a phone conversation",
            "example": "hello there, Katie!",
            "synonyms": [],
            "antonyms": []
          }
        ]
      }
    ]
  }
]
```

### Key Fields Used

- `meanings[0].definitions[0].definition` - The primary definition of the word

### Rate Limits

- No authentication required
- No explicit rate limit documented
- Use responsibly

### Error Responses

**404 Not Found**: Word does not exist
```json
{
  "title": "No Definitions Found",
  "message": "Sorry pal, we couldn't find definitions for the word you were looking for.",
  "resolution": "You can try the search again at later time or head to the web instead."
}
```

## Translation API

### Overview

The application uses Google Translate's public endpoint to translate English words to Chinese.

### Endpoint

```
GET https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q={word}
```

### Parameters

- `client=gtx` - Client identifier
- `sl=en` - Source language (English)
- `tl=zh-CN` - Target language (Simplified Chinese)
- `dt=t` - Data type (translation)
- `q={word}` - The word to translate

### Request Example

```typescript
const word = "hello";
const response = await fetch(
  `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(word)}`
);
const data = await response.json();
const translation = data[0][0][0]; // "你好"
```

### Response Format

The API returns a nested array structure:

```javascript
[
  [
    ["你好", "hello", null, null, 10]
  ],
  // ... additional data
]
```

### Key Fields Used

- `data[0][0][0]` - The translated text

### Important Notes

- This is an **unofficial, undocumented endpoint**
- No API key required
- **Not recommended for production applications**
- May have **rate limits** or **availability issues**
- Google can change or disable this endpoint at any time
- For production use, consider using the [official Google Cloud Translation API](https://cloud.google.com/translate) with proper authentication
- Should not be used for commercial applications without proper licensing

## Fallback Mechanism

When the Translation API fails, the application falls back to a built-in dictionary of common words.

### Fallback Dictionary

```typescript
const fallbackDictionary: Record<string, string> = {
  hello: "你好",
  world: "世界",
  love: "爱",
  water: "水",
  food: "食物",
  // ... more common words
};
```

### Fallback Logic

```typescript
const translateToChinese = async (word: string): Promise<string | null> => {
  try {
    // Try Translation API first
    const response = await fetch(translationUrl);
    if (!response.ok) throw new Error("Translation failed");
    return translation;
  } catch (error) {
    // Fall back to local dictionary
    return fallbackDictionary[word.toLowerCase()] || null;
  }
};
```

## Error Handling

### Strategy

The application implements a graceful degradation approach:

1. **Try Dictionary API** for validation and definition
2. **Try Translation API** for Chinese translation
3. **Fall back to local dictionary** if translation fails
4. **Show user-friendly error** if all methods fail

### Error Handling Example

```typescript
const handleAddWord = async () => {
  try {
    const isValid = await validateWord(word);
    if (!isValid) {
      alert(`The word "${word}" is not recognized as a real word.`);
      return;
    }

    const translation = await translateToChinese(word);
    const definition = await getEnglishDefinition(word);

    if (!translation && !definition) {
      alert(`Could not get translation for "${word}". Please try again.`);
      return;
    }

    // Success - combine and save
    const combined = definition && translation 
      ? `${definition}\n${translation}` 
      : translation || definition;
    
    addWord(word, combined);
  } catch (error) {
    console.error("Error adding word:", error);
    alert("An error occurred. Please try again.");
  }
};
```

## Usage Examples

### Complete Word Addition Flow

```typescript
import { useState } from "react";
import { useWords } from "@/hooks";

export const AddWordExample = () => {
  const { addWord } = useWords();
  const [word, setWord] = useState("");

  const handleSubmit = async () => {
    // 1. Validate word format
    if (!/^[a-zA-Z]+$/.test(word)) {
      alert("Invalid word format");
      return;
    }

    // 2. Check if word exists in dictionary
    const isValid = await validateWord(word);
    if (!isValid) {
      alert("Word not found in dictionary");
      return;
    }

    // 3. Get definition and translation
    const [definition, translation] = await Promise.all([
      getEnglishDefinition(word),
      translateToChinese(word)
    ]);

    // 4. Combine and save
    const combined = [definition, translation]
      .filter(Boolean)
      .join("\n");
    
    addWord(word, combined);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={word} 
        onChange={(e) => setWord(e.target.value.toLowerCase())} 
      />
      <button type="submit">Add Word</button>
    </form>
  );
};
```

### Batch Word Processing

```typescript
const addMultipleWords = async (words: string[]) => {
  const results = await Promise.allSettled(
    words.map(async (word) => {
      const definition = await getEnglishDefinition(word);
      const translation = await translateToChinese(word);
      return { word, definition, translation };
    })
  );

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      const { word, definition, translation } = result.value;
      const combined = [definition, translation]
        .filter(Boolean)
        .join("\n");
      addWord(word, combined);
    } else {
      console.error(`Failed to add word: ${words[index]}`);
    }
  });
};
```

## Best Practices

1. **Cache Results**: Consider caching API responses to reduce redundant calls
2. **Retry Logic**: Implement retry mechanisms for failed requests
3. **Rate Limiting**: Add delays between consecutive API calls
4. **User Feedback**: Always inform users about API errors
5. **Fallback Options**: Provide alternative paths when APIs are unavailable

## Future Improvements

Potential enhancements for API integration:

- Add support for more target languages
- Implement request caching with IndexedDB
- Add offline support with service workers
- Integrate pronunciation audio from external sources
- Add word etymology and usage examples
- Support batch word import from files

## Resources

- [Free Dictionary API Documentation](https://dictionaryapi.dev/)
- [Google Translate API Official Documentation](https://cloud.google.com/translate/docs)
- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
