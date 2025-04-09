"use client";

import { Button } from "@/components/ui/button";
import { 
  EyeOpenIcon, 
  EyeClosedIcon, 
  ClockIcon 
} from "@radix-ui/react-icons";

interface TodoFiltersProps {
  hideCompleted: boolean;
  setHideCompleted: (value: boolean) => void;
  showOnlyUnderTen: boolean;
  setShowOnlyUnderTen: (value: boolean) => void;
  showFilters?: boolean;
}

export function TodoFilters({ 
  hideCompleted, 
  setHideCompleted, 
  showOnlyUnderTen, 
  setShowOnlyUnderTen,
  showFilters = true
}: TodoFiltersProps) {
  if (!showFilters) return null;
  
  return (
    <div className="flex justify-end mb-4 space-x-2">
      <Button
        type="button"
        variant={showOnlyUnderTen ? "default" : "outline"}
        size="sm"
        onClick={() => setShowOnlyUnderTen((prev) => !prev)}
        className={`border border-[#555555] border-dashed border-opacity-70 hover:bg-[#333333] hover:text-white transition-colors ${
          showOnlyUnderTen
            ? "bg-[#4CAF50] text-white border-[#4CAF50]"
            : "text-[#cccccc] bg-transparent"
        }`}
      >
        {showOnlyUnderTen ? (
          <>
            <ClockIcon className="h-3.5 w-3.5 mr-2" />
            All Tasks
          </>
        ) : (
          <>
            <ClockIcon className="h-3.5 w-3.5 mr-2" />
            Under 10 Min Tasks
          </>
        )}
      </Button>
      <Button
        type="button"
        variant={hideCompleted ? "default" : "outline"}
        size="sm"
        onClick={() => setHideCompleted((prev) => !prev)}
        className={`border border-[#555555] border-dashed border-opacity-70 hover:bg-[#333333] hover:text-white transition-colors ${
          hideCompleted
            ? "bg-[#333333] text-white"
            : "text-[#cccccc] bg-transparent"
        }`}
      >
        {hideCompleted ? (
          <>
            <EyeOpenIcon className="h-3.5 w-3.5 mr-2" />
            Show Completed Tasks
          </>
        ) : (
          <>
            <EyeClosedIcon className="h-3.5 w-3.5 mr-2" />
            Hide Completed Tasks
          </>
        )}
      </Button>
    </div>
  );
}
