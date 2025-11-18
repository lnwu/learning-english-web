import * as React from "react";
import { cn } from "@/lib/utils";

interface FrequencyBarProps {
  frequency: number;
  className?: string;
}

const FrequencyBar = React.forwardRef<HTMLDivElement, FrequencyBarProps>(
  ({ frequency, className }, ref) => {
    // Calculate color based on frequency
    // Red (-5 to 0), Yellow (0 to 5), Green (5+)
    const getColor = (freq: number) => {
      if (freq <= 0) {
        // Red shades for negative/zero frequencies
        const intensity = Math.max(0, (freq + 5) / 5); // 0 at -5, 1 at 0
        return `rgb(${255}, ${Math.floor(intensity * 100)}, ${Math.floor(intensity * 100)})`;
      } else if (freq <= 5) {
        // Yellow to green transition (0-5)
        const ratio = freq / 5;
        const red = Math.floor(255 * (1 - ratio));
        const green = 200;
        return `rgb(${red}, ${green}, 0)`;
      } else {
        // Solid green for high frequencies
        return "rgb(34, 197, 94)"; // green-500
      }
    };

    // Calculate height based on frequency (clamped between -5 and 10)
    const clampedFreq = Math.max(-5, Math.min(10, frequency));
    const heightPercentage = ((clampedFreq + 5) / 15) * 100; // -5 to 10 = 0% to 100%

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-2 h-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",
          className
        )}
        title={`Frequency: ${frequency}`}
      >
        <div
          className="absolute bottom-0 w-full transition-all duration-300 rounded-full"
          style={{
            height: `${heightPercentage}%`,
            backgroundColor: getColor(frequency),
          }}
        />
      </div>
    );
  }
);

FrequencyBar.displayName = "FrequencyBar";

export { FrequencyBar };
