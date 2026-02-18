import { TileData } from "@/hooks/useWordle";
import { cn } from "@/lib/utils";

interface WordGridProps {
  guesses: TileData[][];
  currentGuess: string;
  wordLength: number;
  maxAttempts: number;
  shake: boolean;
  revealedIndices: Set<number>;
  targetWord: string;
}

const stateStyles: Record<string, string> = {
  correct: "bg-[hsl(142,71%,45%)] border-[hsl(142,71%,45%)] text-white",
  present: "bg-[hsl(45,93%,47%)] border-[hsl(45,93%,47%)] text-white",
  absent: "bg-[hsl(215,14%,27%)] border-[hsl(215,14%,27%)] text-white",
  empty: "bg-background border-border",
};

export default function WordGrid({ guesses, currentGuess, wordLength, maxAttempts, shake, revealedIndices, targetWord }: WordGridProps) {
  const rows: TileData[][] = [];

  for (const g of guesses) rows.push(g);

  // Current guess row with hints
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
              ? "w-[36px] h-[36px] text-sm sm:w-[44px] sm:h-[44px] sm:text-base"
              : wordLength >= 6
              ? "w-[40px] h-[40px] text-base sm:w-[48px] sm:h-[48px] sm:text-lg"
              : "w-[44px] h-[44px] text-lg sm:w-[52px] sm:h-[52px] sm:text-xl";
            return (
              <div
                key={ci}
                className={cn(
                  "flex items-center justify-center border-2 font-bold uppercase transition-colors duration-300",
                  sizeClass,
                  stateStyles[tile.state]
                )}
              >
                {tile.letter}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
