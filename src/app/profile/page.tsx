"use client";

import { Button } from "@/components/ui";
import { useFirestoreWords } from "@/hooks";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useLocale } from "@/hooks";
import { type Locale } from "@/lib/i18n";

const Profile = observer(() => {
  const { data: session } = useSession();
  const { words, resetPracticeRecords, loading, error } = useFirestoreWords();
  const [isClient, setIsClient] = useState(false);
  const { locale, setLocale, t } = useLocale();
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading) {
    return (
      <main>
        <div className="text-center">Loading your profile...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div className="text-center text-red-500">Error: {error}</div>
      </main>
    );
  }

  const totalWords = words.allWords.size;
  const overallAverageTime = words.getOverallAverageInputTime();
  
  // Calculate statistics
  const wordsWithTimes: Array<{ word: string; avgTime: number; count: number }> = [];
  words.allWords.forEach((translation, word) => {
    const times = words.getInputTimes(word);
    if (times.length > 0) {
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      wordsWithTimes.push({ word, avgTime, count: times.length });
    }
  });

  // Sort by average time (slowest first)
  wordsWithTimes.sort((a, b) => b.avgTime - a.avgTime);

  const handleResetRecords = async () => {
    if (!confirm(t('profile.resetConfirm'))) {
      return;
    }

    setResetting(true);
    try {
      await resetPracticeRecords();
      alert(t('profile.resetSuccess'));
      window.location.reload(); // Reload to show updated stats
    } catch (err) {
      console.error("Reset failed:", err);
      alert(t('profile.resetError'));
    } finally {
      setResetting(false);
    }
  };

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    isClient && (
      <main className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t('profile.title')}</h1>

        {/* User Info */}
        {session?.user && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{t('profile.accountInfo')}</h2>
            <div className="space-y-2">
              <p><strong>{t('profile.email')}:</strong> {session.user.email}</p>
              {session.user.name && <p><strong>{t('profile.name')}:</strong> {session.user.name}</p>}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('profile.settings')}</h2>
          
          {/* Language Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">{t('profile.language')}</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('zh')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  locale === 'zh'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                中文
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  locale === 'en'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Reset Practice Records */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">{t('profile.resetData')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('profile.resetDataDesc')}
            </p>
            <Button
              variant="outline"
              onClick={handleResetRecords}
              disabled={resetting}
              className="bg-red-50 hover:bg-red-100 text-red-600 border-red-300"
            >
              {resetting ? t('common.loading') : t('profile.resetButton')}
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('profile.statistics')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                {totalWords}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('profile.totalWords')}</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-300">
                {overallAverageTime !== null ? `${overallAverageTime.toFixed(1)}${t('profile.seconds')}` : t('profile.noData')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('profile.averageTime')}</div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                {wordsWithTimes.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('profile.wordsPracticed')}</div>
            </div>
          </div>
        </div>

        {/* Average Speed by Word Length */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">按单词长度分类的平均输入速度</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            根据单词长度分组的平均输入时间
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { category: 0, label: "短单词 (≤5字母)", color: "blue" },
              { category: 1, label: "中等单词 (6-10字母)", color: "yellow" },
              { category: 2, label: "长单词 (>10字母)", color: "red" }
            ].map(({ category, label, color }) => {
              const avgTime = words.getAverageTimeByLengthCategory(category);
              const colorClasses = {
                blue: "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
                yellow: "bg-yellow-50 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300",
                red: "bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300"
              };
              
              return (
                <div key={category} className={`p-4 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
                  <div className="text-2xl font-bold">
                    {avgTime !== null ? `${avgTime.toFixed(2)}秒` : '暂无数据'}
                  </div>
                  <div className="text-sm opacity-80 mt-1">{label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Word Performance Details */}
        {wordsWithTimes.length > 0 && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Word Performance</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Words sorted by average input time (slowest first)
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {wordsWithTimes.map(({ word, avgTime, count }) => (
                <div
                  key={word}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div className="flex-1">
                    <span className="font-medium">{word}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      ({count} practice{count !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{avgTime.toFixed(1)}s</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      熟悉程度: {words.getFrequency(word)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data Message */}
        {wordsWithTimes.length === 0 && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No practice data yet. Start practicing words to see your statistics!
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex space-x-4">
          <Link href="/home">
            <Button>Practice Words</Button>
          </Link>
          <Link href="/add-word">
            <Button variant="outline">Add New Word</Button>
          </Link>
          <Link href="/all-words">
            <Button variant="outline">View All Words</Button>
          </Link>
        </div>
      </main>
    )
  );
});

export default Profile;
