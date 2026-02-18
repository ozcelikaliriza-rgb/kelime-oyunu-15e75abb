import { useEffect } from "react";
import { useWordle } from "@/hooks/useWordle";
import WordGrid from "@/components/WordGrid";
import Keyboard from "@/components/Keyboard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const Index = () => {
  const game = useWordle();

  // Physical keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === "ENTER") game.submitGuess();
      else if (key === "BACKSPACE") game.removeLetter();
      else if (/^[A-ZÇĞİÖŞÜ]$/.test(key) && key.length === 1) game.addLetter(key);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [game.submitGuess, game.removeLetter, game.addLetter]);

  if (game.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-lg font-bold">Yükleniyor...</p>
      </div>
    );
  }

  // Game over summary
  if (game.gameOver) {
    const totalAttempts = game.results.reduce((s, r) => s + r.attempts, 0);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 gap-6">
        <h1 className="text-3xl font-bold">🎉 Tebrikler!</h1>
        <p className="text-lg text-gray-600">Tüm seviyeleri tamamladın!</p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {game.results.map((r) => (
            <div key={r.level} className="flex justify-between border-b border-gray-200 py-2 text-sm font-medium">
              <span>{r.level} Harf</span>
              <span>{r.solved ? `${r.attempts} tahmin` : "Başarısız"}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 text-base font-bold">
            <span>Toplam</span>
            <span>{totalAttempts} tahmin</span>
          </div>
        </div>
        <Button onClick={game.restartGame} className="mt-4 bg-foreground text-white hover:bg-foreground/90">
          Tekrar Oyna
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-2 py-4 sm:py-6">
      {/* Header */}
      <header className="flex flex-col items-center gap-2 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Türkçe Wordle</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            Seviye {game.currentLevelIndex + 1} — {game.wordLength} Harf
          </span>
        </div>
        {/* Progress dots */}
        <div className="flex gap-2">
          {game.levels.map((l, i) => (
            <div
              key={l}
              className={`w-3 h-3 rounded-full border-2 transition-colors ${
                i < game.currentLevelIndex
                  ? "bg-[#22C55E] border-[#22C55E]"
                  : i === game.currentLevelIndex
                  ? "bg-foreground border-foreground"
                  : "bg-white border-gray-300"
              }`}
            />
          ))}
        </div>
      </header>

      {/* Invalid word message */}
      {game.invalidWord && (
        <p className="text-sm text-red-500 font-medium mb-2">Geçersiz kelime!</p>
      )}

      {/* Grid */}
      <div className="flex-1 flex items-center">
        <WordGrid
          guesses={game.guesses}
          currentGuess={game.currentGuess}
          wordLength={game.wordLength}
          maxAttempts={game.maxAttempts}
          shake={game.shake}
        />
      </div>

      {/* Keyboard */}
      <div className="w-full mt-4 pb-2">
        <Keyboard
          letterStates={game.letterStates}
          onKey={game.addLetter}
          onEnter={game.submitGuess}
          onBackspace={game.removeLetter}
        />
      </div>

      {/* Level Complete Modal */}
      <Dialog open={game.levelComplete} onOpenChange={() => {}}>
        <DialogContent className="bg-white border-gray-200 max-w-sm [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Tebrikler!</DialogTitle>
            <DialogDescription className="text-center text-base text-gray-600">
              {game.wordLength} harfli kelimeyi {game.guesses.length} tahminde buldun!
            </DialogDescription>
          </DialogHeader>
          <Button onClick={game.nextLevel} className="w-full bg-foreground text-white hover:bg-foreground/90">
            Sonraki Seviye →
          </Button>
        </DialogContent>
      </Dialog>

      {/* Level Failed Modal */}
      <Dialog open={game.levelFailed} onOpenChange={() => {}}>
        <DialogContent className="bg-white border-gray-200 max-w-sm [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">😞 Bulamadın</DialogTitle>
            <DialogDescription className="text-center text-base text-gray-600">
              Doğru kelime: <strong className="text-foreground">{game.targetWord}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button onClick={game.retryLevel} variant="outline" className="flex-1">
              Tekrar Dene
            </Button>
            {game.currentLevelIndex < game.levels.length - 1 && (
              <Button onClick={game.nextLevel} className="flex-1 bg-foreground text-white hover:bg-foreground/90">
                Sonraki →
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
