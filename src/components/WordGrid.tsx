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
    <div className="flex flex-col items-center gap-1.5">
      {rows.map((row, ri) => (
        <div
          key={ri}
          className={cn("flex gap-1.5", ri === currentRowIndex && shake && "animate-shake")}
        >
          {row.map((tile, ci) => (
            <div
              key={ci}
              className={cn(
                "flex items-center justify-center w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] border-2 text-xl sm:text-2xl font-bold uppercase transition-colors duration-300",
                stateStyles[tile.state]
              )}
            >
              {tile.letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
