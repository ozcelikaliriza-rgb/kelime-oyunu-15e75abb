import { TileData } from "@/hooks/useWordle";
import { cn } from "@/lib/utils";

interface WordGridProps {
  guesses: TileData[][];
  currentGuess: string;
  wordLength: number;
  maxAttempts: number;
  shake: boolean;
}

const stateStyles: Record<string, string> = {
  correct: "bg-[#22C55E] border-[#22C55E] text-white",
  present: "bg-[#EAB308] border-[#EAB308] text-white",
  absent: "bg-[#374151] border-[#374151] text-white",
  empty: "bg-white border-[#D1D5DB]",
};

export default function WordGrid({ guesses, currentGuess, wordLength, maxAttempts, shake }: WordGridProps) {
  const rows: TileData[][] = [];

  // Filled guesses
  for (const g of guesses) rows.push(g);

  // Current guess row
  if (rows.length < maxAttempts) {
    const current: TileData[] = [];
    for (let i = 0; i < wordLength; i++) {
      current.push({ letter: currentGuess[i] || "", state: "empty" });
    }
    rows.push(current);
  }

  // Empty rows
  while (rows.length < maxAttempts) {
    rows.push(Array.from({ length: wordLength }, () => ({ letter: "", state: "empty" as const })));
  }

  const currentRowIndex = guesses.length;

  return (
    <div className="flex flex-col items-center gap-1">
      {rows.map((row, ri) => (
        <div
          key={ri}
          className={cn("flex gap-1", ri === currentRowIndex && shake && "animate-shake")}
        >
          {row.map((tile, ci) => {
            // Dynamic tile size based on word length
            const sizeClass = wordLength >= 7
              ? "w-[40px] h-[40px] text-base sm:w-[48px] sm:h-[48px] sm:text-lg"
              : wordLength >= 6
              ? "w-[44px] h-[44px] text-lg sm:w-[52px] sm:h-[52px] sm:text-xl"
              : "w-[48px] h-[48px] text-xl sm:w-[56px] sm:h-[56px] sm:text-2xl";
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
