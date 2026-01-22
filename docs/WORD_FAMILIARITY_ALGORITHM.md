# Word Familiarity Algorithm

## Overview

This document describes the algorithm used to evaluate and track user familiarity with English vocabulary words. The system combines spaced repetition principles with performance-based metrics to provide an adaptive learning experience.

## Core Concepts

### 1. Mastery Score (0-100)

Each word has a **mastery score** ranging from 0 to 100:

| Score Range | Level | Description |
|-------------|-------|-------------|
| 0-19 | New | Just added, never practiced |
| 20-39 | Learning | Early practice phase |
| 40-59 | Familiar | Making progress |
| 60-79 | Proficient | Good recall ability |
| 80-100 | Mastered | Excellent, long-term retention |

### 2. Scoring Factors

The mastery score is calculated based on three factors:

#### A. Accuracy Factor (40% weight)
- Tracks correct vs incorrect attempts
- A correct input = full word typed correctly
- An incorrect input = any mistake or hint usage

```
accuracyScore = (correctCount / totalAttempts) * 100
```

#### B. Speed Factor (30% weight)
- Compares input speed to expected speed based on word length
- Expected time formula: `expectedSeconds = wordLength * 0.3 + 1.0`
- Speed ratio: `speedRatio = expectedTime / actualTime`

```
speedScore = min(100, speedRatio * 40)
```

| Speed Ratio | Speed Score | Interpretation |
|-------------|-------------|----------------|
| 2.0+ | 80 | Excellent (2x faster than expected) |
| 1.5 | 60 | Very Good |
| 1.0 | 40 | Average (matches expected) |
| 0.5 | 20 | Slow |
| 0.25 | 10 | Very Slow |

#### C. Consistency Factor (30% weight)
- Measures how consistent the user's performance is over time
- Lower variance = higher consistency score
- Calculated from the last 10 input times

```
variance = standardDeviation(lastTenTimes) / mean(lastTenTimes)
consistencyScore = max(0, 100 - variance * 100)
```

### 3. Final Mastery Calculation

```
masteryScore = (accuracyScore * 0.4) + (speedScore * 0.3) + (consistencyScore * 0.3)

Early-attempt caps are applied:
- If totalAttempts < 3, masteryScore is capped at 39 (Learning)
- If totalAttempts < 5, masteryScore is capped at 59 (Familiar)
```

### 4. Practice Priority (Selection Weight)

Words are selected for practice based on priority scoring:

```
priority = (100 - masteryScore) * recencyMultiplier * practiceCountMultiplier
```

#### Recency Multiplier
How recently the word was practiced:

**Priority Rule**: Words not practiced for 7+ days receive extremely high priority to guarantee weekly review for all words.

| Days Since Last Practice | Multiplier | Purpose |
|--------------------------|------------|---------|
| 0 (today) | 0.3 | Just practiced, low priority |
| 1 | 0.8 | Recent practice |
| 2-3 | 1.2 | Normal spacing |
| 4-6 | 2.0 | Due for review |
| 7-13 | 8.0 | **Weekly review enforcement** |
| 14+ | 15.0 | **Overdue - critical priority** |

#### Practice Count Multiplier
How many times the word has been practiced:

| Practice Count | Multiplier |
|----------------|------------|
| 0 | 3.0 |
| 1-2 | 2.0 |
| 3-5 | 1.5 |
| 6-10 | 1.0 |
| 11+ | 0.8 |

### 5. Incorrect Attempt Rules

When a user makes a mistake:
- Any full-length incorrect input counts as an incorrect attempt
- Revealing a hint (hover/focus on ❌) also counts as an incorrect attempt
- No speed score recorded for incorrect attempts

## Data Structure

Each word stores the following metrics in Firestore:

```typescript
interface WordData {
  word: string;
  translation: string;
  
  // Performance tracking
  correctCount: number;      // Total correct inputs
  totalAttempts: number;     // Total practice attempts
  inputTimes: number[];      // Last 20 input times in seconds
  
  // Temporal tracking
  lastPracticedAt: Date;     // When last practiced
  createdAt: Date;           // When added
  
  // Document ID from Firestore
  id: string;
}
```

## Implementation

The mastery calculation is implemented in `/src/lib/masteryCalculator.ts`.

### Calculate Mastery Score

```typescript
function calculateMasteryScore(metrics: WordMetrics): MasteryResult {
  const { word, correctCount, totalAttempts, inputTimes } = metrics;
  
  // If never practiced, return 0
  if (totalAttempts === 0) {
    return {
      score: 0,
      level: "new",
      accuracyScore: 0,
      speedScore: 0,
      consistencyScore: 0,
    };
  }
  
  // Accuracy Factor (40%)
  const accuracyScore = (correctCount / totalAttempts) * 100;
  
  // Speed Factor (30%)
  const expectedTime = word.length * 0.3 + 1.0;
  const avgInputTime = inputTimes.length > 0
    ? inputTimes.reduce((a, b) => a + b, 0) / inputTimes.length
    : expectedTime * 2;
  const speedRatio = expectedTime / avgInputTime;
  const speedScore = Math.min(100, speedRatio * 40);
  
  // Consistency Factor (30%)
  let consistencyScore = 30; // Default for < 3 attempts
  if (inputTimes.length >= 3) {
    const lastTimes = inputTimes.slice(-10);
    const mean = lastTimes.reduce((a, b) => a + b, 0) / lastTimes.length;
    const variance = Math.sqrt(
      lastTimes.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / lastTimes.length
    );
    const cv = mean > 0 ? variance / mean : 0;
    consistencyScore = Math.max(0, Math.min(100, 100 - cv * 100));
  }
  
  // Final score
  let score = Math.round(
    accuracyScore * 0.4 + speedScore * 0.3 + consistencyScore * 0.3
  );

  if (totalAttempts < 3) {
    score = Math.min(score, 39);
  } else if (totalAttempts < 5) {
    score = Math.min(score, 59);
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    level: getMasteryLevel(score),
    accuracyScore: Math.round(accuracyScore),
    speedScore: Math.round(speedScore),
    consistencyScore: Math.round(consistencyScore),
  };
}
```

### Calculate Practice Priority

```typescript
function calculatePriority(
  masteryScore: number,
  lastPracticedAt: Date | null,
  totalAttempts: number
): number {
  // Days since last practice
  const daysSince = lastPracticedAt 
    ? (Date.now() - lastPracticedAt.getTime()) / (1000 * 60 * 60 * 24)
    : 30;
  
  // Recency multiplier
  let recencyMultiplier: number;
  if (daysSince < 1) recencyMultiplier = 0.5;
  else if (daysSince < 2) recencyMultiplier = 1.0;
  else if (daysSince < 4) recencyMultiplier = 1.5;
  else if (daysSince < 8) recencyMultiplier = 2.0;
  else if (daysSince < 15) recencyMultiplier = 2.5;
  else recencyMultiplier = 3.0;
  
  // Practice count multiplier
  let practiceMultiplier: number;
  if (totalAttempts === 0) practiceMultiplier = 3.0;
  else if (totalAttempts <= 2) practiceMultiplier = 2.0;
  else if (totalAttempts <= 5) practiceMultiplier = 1.5;
  else if (totalAttempts <= 10) practiceMultiplier = 1.0;
  else practiceMultiplier = 0.8;
  
  return (100 - masteryScore) * recencyMultiplier * practiceMultiplier;
}
```

## UI Display

### Mastery Bar Visualization

The mastery score is displayed as a 5-segment progress bar:

```
Score 0-19:   [■□□□□] New
Score 20-39:  [■■□□□] Learning  
Score 40-59:  [■■■□□] Familiar
Score 60-79:  [■■■■□] Proficient
Score 80-100: [■■■■■] Mastered
```

### Color Coding

| Level | Color | Tailwind Class |
|-------|-------|----------------|
| New | Red | bg-red-500 |
| Learning | Orange | bg-orange-500 |
| Familiar | Yellow | bg-yellow-500 |
| Proficient | Lime | bg-lime-500 |
| Mastered | Green | bg-green-500 |

## Migration from Old System

The old system used:
- `frequency`: A number that increased/decreased based on performance
- `inputTimes`: Array of input times (kept)

Migration approach:
1. Keep existing `inputTimes` data
2. Initialize `correctCount` based on inputTimes length (assume all were correct)
3. Initialize `totalAttempts` = inputTimes.length
4. Set `lastPracticedAt` = now for words with inputTimes, null otherwise
5. Calculate initial `masteryScore` from available data

The migration is handled automatically when data is loaded from Firestore.

## Benefits Over Old System

1. **Intuitive Scoring**: 0-100 scale is easy to understand
2. **Multi-factor Evaluation**: Considers accuracy, speed, and consistency
3. **Spaced Repetition**: Built-in recency-based priority for word selection
4. **Fair Speed Comparison**: Word-length-adjusted expected times
5. **Transparent**: Users can understand why a word has a certain score
6. **Detailed Breakdown**: Shows individual factor scores for debugging/transparency
