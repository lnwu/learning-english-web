import * as React from "react";
import { cn } from "@/lib/utils";

interface SyncIndicatorProps {
  syncing: boolean;
  className?: string;
}

const SyncIndicator = React.forwardRef<HTMLDivElement, SyncIndicatorProps>(
  ({ syncing, className }, ref) => {
    if (!syncing) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-pulse",
          className
        )}
        title="Syncing data to cloud..."
      >
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="text-sm font-medium">Syncing...</span>
      </div>
    );
  }
);

SyncIndicator.displayName = "SyncIndicator";

export { SyncIndicator };
