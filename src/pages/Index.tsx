import { useEffect } from "react";
import { useWordle, trUpper } from "@/hooks/useWordle";
import WordGrid from "@/components/WordGrid";
import Keyboard from "@/components/Keyboard";
import { Button } from "@/components/ui/button";

const Index = () => {
  const game = useWordle();

  // Physical keyboard support with Turkish locale
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const raw = e.key;
      if (raw === "Enter") game.submitGuess();
      else if (raw === "Backspace") game.removeLetter();
      else {
        const key = trUpper(raw);
        if (/^[A-ZÇĞİÖŞÜ]$/.test(key) && key.length === 1) game.addLetter(key);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [game.submitGuess, game.removeLetter, game.addLetter]);

  if (game.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-lg font-bold text-foreground">Yükleniyor...</p>
      </div>
    );
  }

  // Game over summary
  if (game.gameOver) {
    const totalAttempts = game.results.reduce((s, r) => s + r.attempts, 0);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 gap-4">
        <h1 className="text-3xl font-bold text-foreground">🎉 Tebrikler!</h1>
        <p className="text-base text-muted-foreground">Tüm seviyeleri tamamladın!</p>
        <div className="flex flex-col gap-1 w-full max-w-xs">
          {game.results.map((r) => (
            <div key={r.level} className="flex justify-between border-b border-border py-1.5 text-sm font-medium text-foreground">
              <span>{r.level} Harf</span>
              <span>{r.solved ? `${r.attempts} tahmin` : "Başarısız"}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 text-base font-bold text-foreground">
            <span>Toplam</span>
            <span>{totalAttempts} tahmin</span>
          </div>
        </div>
        <Button onClick={game.restartGame} className="mt-2">
          Tekrar Oyna
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center bg-background px-2 py-2">
      {/* Header - compact */}
      <header className="flex flex-col items-center gap-1 mb-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Türkçe Wordle</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Seviye {game.currentLevelIndex + 1} — {game.wordLength} Harf
          </span>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {game.levels.map((l, i) => (
              <div
                key={l}
                className={`w-2 h-2 rounded-full border transition-colors ${
                  i < game.currentLevelIndex
                    ? "bg-[#22C55E] border-[#22C55E]"
                    : i === game.currentLevelIndex
                    ? "bg-foreground border-foreground"
                    : "bg-background border-border"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Invalid word message */}
      {game.invalidWord && (
        <p className="text-xs text-destructive font-medium mb-1">Geçersiz kelime!</p>
      )}

      {/* Grid - flex-1 to fill available space */}
      <div className="flex-1 flex items-center py-1">
        <WordGrid
          guesses={game.guesses}
          currentGuess={game.currentGuess}
          wordLength={game.wordLength}
          maxAttempts={game.maxAttempts}
          shake={game.shake}
        />
      </div>

      {/* Keyboard */}
      <div className="w-full pb-1">
        <Keyboard
          letterStates={game.letterStates}
          onKey={game.addLetter}
          onEnter={game.submitGuess}
          onBackspace={game.removeLetter}
        />
      </div>

      {/* Level Failed - inline banner instead of modal */}
      {game.levelFailed && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-background rounded-lg p-6 max-w-sm w-[90%] flex flex-col items-center gap-3 shadow-lg border border-border">
            <p className="text-xl font-bold text-foreground">😞 Bulamadın</p>
            <p className="text-sm text-muted-foreground">
              Doğru kelime: <strong className="text-foreground">{game.targetWord}</strong>
            </p>
            <div className="flex gap-2 w-full">
              <Button onClick={game.retryLevel} variant="outline" className="flex-1">
                Tekrar Dene
              </Button>
              {game.currentLevelIndex < game.levels.length - 1 && (
                <Button onClick={game.nextLevel} className="flex-1">
                  Sonraki →
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
