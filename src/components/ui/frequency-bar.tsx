import * as React from "react";
import { cn } from "@/lib/utils";

interface FrequencyBarProps {
  frequency: number;
  className?: string;
}

// Convert frequency to mastery level (0-4, where 4 is highest mastery)
const getMasteryLevel = (frequency: number): number => {
  // Map frequency to 5 mastery levels (0-4)
  // freq <= -3: level 0 (not mastered at all)
  // freq -2 to 0: level 1 (beginner)
  // freq 1 to 3: level 2 (learning)
  // freq 4 to 6: level 3 (familiar)
  // freq >= 7: level 4 (mastered)
  if (frequency <= -3) return 0;
  if (frequency <= 0) return 1;
  if (frequency <= 3) return 2;
  if (frequency <= 6) return 3;
  return 4;
};

const FrequencyBar = React.forwardRef<HTMLDivElement, FrequencyBarProps>(
  ({ frequency, className }, ref) => {
    const masteryLevel = getMasteryLevel(frequency);
    
    // Define colors for each mastery level
    const levelColors = [
      "bg-red-500",      // Level 0: Not mastered
      "bg-orange-500",   // Level 1: Beginner
      "bg-yellow-500",   // Level 2: Learning
      "bg-lime-500",     // Level 3: Familiar
      "bg-green-500",    // Level 4: Mastered
    ];

    const levelLabels = [
      "未掌握",  // Not mastered
      "初学",    // Beginner
      "学习中",  // Learning
      "熟悉",    // Familiar
      "已掌握",  // Mastered
    ];

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center gap-1", className)}
        title={`熟悉程度: ${levelLabels[masteryLevel]} (${frequency})`}
      >
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "w-4 h-3 rounded-sm transition-all duration-300",
                level <= masteryLevel
                  ? levelColors[level]
                  : "bg-gray-300 dark:bg-gray-600"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {levelLabels[masteryLevel]}
        </span>
      </div>
    );
  }
);

FrequencyBar.displayName = "FrequencyBar";

export { FrequencyBar, getMasteryLevel };
