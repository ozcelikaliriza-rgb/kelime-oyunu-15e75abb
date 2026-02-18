import { LetterState } from "@/hooks/useWordle";
import { cn } from "@/lib/utils";
import { Delete } from "lucide-react";

const ROWS = [
  ["E", "R", "T", "Y", "U", "I", "O", "P", "Ğ", "Ü"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ş", "İ"],
  ["ENTER", "Z", "C", "V", "B", "N", "M", "Ö", "Ç", "⌫"],
];

const keyStateStyles: Record<string, string> = {
  correct: "bg-[hsl(var(--tile-correct))] text-white border-[hsl(var(--tile-correct))]",
  present: "bg-[hsl(var(--tile-present))] text-white border-[hsl(var(--tile-present))]",
  absent: "bg-[hsl(var(--tile-absent))] text-white border-[hsl(var(--tile-absent))]",
};

interface KeyboardProps {
  letterStates: Record<string, LetterState>;
  onKey: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
}

export default function Keyboard({ letterStates, onKey, onEnter, onBackspace }: KeyboardProps) {
  const handleClick = (key: string) => {
    if (key === "ENTER") onEnter();
    else if (key === "⌫") onBackspace();
    else onKey(key);
  };

  return (
    <div className="flex flex-col items-center gap-1 w-full max-w-lg mx-auto">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-0.5 sm:gap-1 justify-center w-full">
          {row.map((key) => {
            const isSpecial = key === "ENTER" || key === "⌫";
            const state = letterStates[key];
            return (
              <button
                key={key}
                onClick={() => handleClick(key)}
                className={cn(
                  "flex items-center justify-center rounded font-bold border-2 transition-colors duration-200 select-none",
                  isSpecial
                    ? "px-1.5 sm:px-3 h-10 sm:h-12 text-[10px] sm:text-xs bg-secondary border-secondary text-secondary-foreground min-w-[40px] sm:min-w-[56px]"
                    : "w-[28px] sm:w-[36px] h-10 sm:h-12 text-xs sm:text-sm bg-secondary border-secondary text-secondary-foreground",
                  state && keyStateStyles[state]
                )}
              >
                {key === "⌫" ? <Delete className="w-4 h-4" /> : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
