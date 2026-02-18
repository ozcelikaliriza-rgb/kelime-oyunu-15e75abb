import { TileData } from "@/hooks/useWordle";
import { cn } from "@/lib/utils";
import { Check, Circle, Minus } from "lucide-react";

interface WordGridProps {
  guesses: TileData[][];
  currentGuess: string;
  wordLength: number;
  maxAttempts: number;
  shake: boolean;
  bounceRow: number | null;
  revealedIndices: Set<number>;
  targetWord: string;
  colorBlind?: boolean;
}

const stateStyles: Record<string, string> = {
  correct: "bg-[hsl(var(--tile-correct))] border-[hsl(var(--tile-correct))] text-white",
  present: "bg-[hsl(var(--tile-present))] border-[hsl(var(--tile-present))] text-white",
  absent: "bg-[hsl(var(--tile-absent))] border-[hsl(var(--tile-absent))] text-white",
  empty: "bg-background border-border",
};

function CbIcon({ state }: { state: string }) {
  if (state === "correct") return <Check className="w-2.5 h-2.5 absolute bottom-0.5 right-0.5 opacity-80" />;
  if (state === "present") return <Circle className="w-2 h-2 absolute bottom-0.5 right-0.5 opacity-80" />;
  if (state === "absent") return <Minus className="w-2.5 h-2.5 absolute bottom-0.5 right-0.5 opacity-80" />;
  return null;
}

export default function WordGrid({ guesses, currentGuess, wordLength, maxAttempts, shake, bounceRow, revealedIndices, targetWord, colorBlind }: WordGridProps) {
  const rows: TileData[][] = [];

  for (const g of guesses) rows.push(g);

  if (rows.length < maxAttempts) {
    const current: TileData[] = [];
    for (let i = 0; i < wordLength; i++) {
      if (revealedIndices.has(i) && !currentGuess[i]) {
        current.push({ letter: targetWord[i], state: "correct" });
      } else {
        current.push({ letter: currentGuess[i] || (revealedIndices.has(i) ? targetWord[i] : ""), state: revealedIndices.has(i) ? "correct" : "empty" });
      }
    }
    rows.push(current);
  }

  while (rows.length < maxAttempts) {
    rows.push(Array.from({ length: wordLength }, () => ({ letter: "", state: "empty" as const })));
  }

  const currentRowIndex = guesses.length;

  return (
    <div className="flex flex-col items-center gap-0.5">
      {rows.map((row, ri) => (
        <div
          key={ri}
          className={cn("flex gap-0.5", ri === currentRowIndex && shake && "animate-shake")}
        >
          {row.map((tile, ci) => {
            const sizeClass = wordLength >= 7
              ? "w-[38px] h-[38px] text-sm sm:w-[46px] sm:h-[46px] sm:text-base"
              : wordLength >= 6
              ? "w-[42px] h-[42px] text-base sm:w-[50px] sm:h-[50px] sm:text-lg"
              : "w-[48px] h-[48px] text-lg sm:w-[56px] sm:h-[56px] sm:text-xl";
            return (
              <div
                key={ci}
                style={bounceRow === ri ? { animationDelay: `${ci * 80}ms` } : undefined}
                className={cn(
                  "relative flex items-center justify-center border-2 font-bold uppercase transition-colors duration-300",
                  sizeClass,
                  stateStyles[tile.state],
                  bounceRow === ri && "animate-bounce-cell"
                )}
              >
                {tile.letter}
                {colorBlind && tile.state !== "empty" && <CbIcon state={tile.state} />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
