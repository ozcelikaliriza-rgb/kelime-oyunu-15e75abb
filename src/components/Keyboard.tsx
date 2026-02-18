import { LetterState } from "@/hooks/useWordle";
import { cn } from "@/lib/utils";
import { Delete } from "lucide-react";

const ROWS = [
  ["E", "R", "T", "Y", "U", "I", "O", "P", "Ğ", "Ü"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ş", "İ"],
  ["ENTER", "Z", "C", "V", "B", "N", "M", "Ö", "Ç", "⌫"],
];

const keyStateStyles: Record<string, string> = {
  correct: "bg-[#22C55E] text-white border-[#22C55E]",
  present: "bg-[#EAB308] text-white border-[#EAB308]",
  absent: "bg-[#374151] text-white border-[#374151]",
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
    <div className="flex flex-col items-center gap-1.5 w-full max-w-lg mx-auto">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1 justify-center w-full">
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
                    ? "px-2 sm:px-4 h-12 sm:h-14 text-xs sm:text-sm bg-gray-200 border-gray-200 text-foreground min-w-[48px] sm:min-w-[64px]"
                    : "w-[30px] sm:w-[40px] h-12 sm:h-14 text-sm sm:text-base bg-gray-100 border-gray-200 text-foreground",
                  state && keyStateStyles[state]
                )}
              >
                {key === "⌫" ? <Delete className="w-5 h-5" /> : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
