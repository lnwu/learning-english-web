"use client";

import { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { Input, Button, Alert } from "@/components/ui";
import { useFirestoreWords, useLocale } from "@/hooks";
import { generateSentence, checkTranslation, type GeneratedSentence } from "@/lib/sentenceGenerator";

const SentencePractice = observer(() => {
  const { words, loading: wordsLoading, error: wordsError } = useFirestoreWords();
  const { t } = useLocale();
  const [currentSentence, setCurrentSentence] = useState<GeneratedSentence | null>(null);
  const [userTranslation, setUserTranslation] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
    missingWords?: string[];
  }>({ type: null, message: "" });
  const [isChecking, setIsChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate a new sentence when component mounts or when generating next question
  const generateNewSentence = () => {
    const allWords = Array.from(words.allWords.keys());
    
    if (allWords.length < 3) {
      setCurrentSentence(null);
      return;
    }

    // Randomly choose between 3-5 words based on availability
    const maxWords = Math.min(5, allWords.length);
    const minWords = 3;
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;

    const sentence = generateSentence(allWords, wordCount);
    setCurrentSentence(sentence);
    setUserTranslation("");
    setFeedback({ type: null, message: "" });
    
    // Focus input after a short delay to ensure rendering is complete
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    if (!wordsLoading && words.allWords.size >= 3) {
      generateNewSentence();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordsLoading, words.allWords.size]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSentence || !userTranslation.trim()) {
      return;
    }

    setIsChecking(true);

    // Check if translation contains all required words
    setTimeout(() => {
      const result = checkTranslation(userTranslation, currentSentence.words);

      if (result.success) {
        setFeedback({
          type: "success",
          message: t('sentencePractice.correct'),
        });
      } else {
        setFeedback({
          type: "error",
          message: t('sentencePractice.incorrect'),
          missingWords: result.missingWords,
        });
      }

      setIsChecking(false);
    }, 300);
  };

  const handleNext = () => {
    generateNewSentence();
  };

  if (wordsLoading) {
    return (
      <main className="container mx-auto p-4 max-w-2xl">
        <div className="text-center">{t('common.loading')}</div>
      </main>
    );
  }

  if (wordsError) {
    return (
      <main className="container mx-auto p-4 max-w-2xl">
        <div className="text-center text-red-500">{t('common.error')}: {wordsError}</div>
        <div className="text-center mt-4">
          <Link href="/add-word">
            <Button>{t('addWord.title')}</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (words.allWords.size < 3) {
    return (
      <main className="container mx-auto p-4 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-center">{t('sentencePractice.title')}</h1>
          <Alert variant="warning">
            {t('sentencePractice.noWords')}
          </Alert>
          <div className="flex justify-center space-x-2">
            <Link href="/add-word">
              <Button>{t('sentencePractice.goToAddWord')}</Button>
            </Link>
            <Link href="/home">
              <Button variant="outline">{t('sentencePractice.home')}</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <div className="space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold mb-2">{t('sentencePractice.title')}</h1>
          <p className="text-gray-600">{t('sentencePractice.instruction')}</p>
        </header>

        {currentSentence && (
          <div className="space-y-4">
            {/* Words to use */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="font-semibold text-sm text-blue-900 mb-2">
                {t('sentencePractice.words')}:
              </h2>
              <div className="flex flex-wrap gap-2">
                {currentSentence.words.map((word, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            {/* Chinese sentence */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-sm text-gray-700 mb-2">
                {t('sentencePractice.chineseSentence')}:
              </h2>
              <p className="text-lg font-medium">{currentSentence.chinese}</p>
            </div>

            {/* Translation input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="translation" className="block font-semibold text-sm text-gray-700 mb-2">
                  {t('sentencePractice.yourTranslation')}:
                </label>
                <Input
                  id="translation"
                  ref={inputRef}
                  type="text"
                  placeholder={t('sentencePractice.placeholder')}
                  value={userTranslation}
                  onChange={(e) => setUserTranslation(e.target.value)}
                  className="w-full"
                  disabled={isChecking}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={!userTranslation.trim() || isChecking}
                  className="flex-1"
                >
                  {isChecking ? t('sentencePractice.checking') : t('sentencePractice.submit')}
                </Button>
                {feedback.type && (
                  <Button 
                    type="button"
                    onClick={handleNext}
                    variant="outline"
                    className="flex-1"
                  >
                    {t('sentencePractice.next')}
                  </Button>
                )}
              </div>
            </form>

            {/* Feedback */}
            {feedback.type && (
              <div className="space-y-2">
                <Alert variant={feedback.type === "success" ? "success" : "error"}>
                  <div className="space-y-2">
                    <p className="font-semibold">{feedback.message}</p>
                    {feedback.missingWords && feedback.missingWords.length > 0 && (
                      <div>
                        <p className="text-sm">
                          {t('sentencePractice.missingWords')}: {feedback.missingWords.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </Alert>

                {/* Show example translation */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-green-900 mb-2">
                    {t('sentencePractice.exampleTranslation')}:
                  </h3>
                  <p className="text-green-800">{currentSentence.english}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-center space-x-2 pt-4 border-t">
          <Link href="/home">
            <Button variant="outline">{t('sentencePractice.home')}</Button>
          </Link>
          <Link href="/add-word">
            <Button variant="outline">{t('sentencePractice.addWord')}</Button>
          </Link>
        </div>
      </div>
    </main>
  );
});

export default SentencePractice;
