import { useEffect } from "react";
import { useWordle, trUpper } from "@/hooks/useWordle";
import WordGrid from "@/components/WordGrid";
import Keyboard from "@/components/Keyboard";
import { Lightbulb, Timer } from "lucide-react";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const Index = () => {
  const game = useWordle();

  // Auto-focus for immediate typing
  useEffect(() => {
    window.focus();
  }, [game.currentLevelIndex]);

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

  if (!game.gameStarted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 gap-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Türkçe Wordle</h1>
          <p className="text-sm text-muted-foreground text-center max-w-xs">4'ten 8'e kadar harfli kelimeleri tahmin et!</p>
        </div>
        <button
          onClick={game.startGame}
          className="px-8 py-3 rounded-full bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
        >
          Oyuna Başla
        </button>
      </div>
    );
  }

  if (game.gameOver) {
    const allSolved = game.results.every((r) => r.solved);
    const totalAttempts = game.results.reduce((s, r) => s + r.attempts, 0);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 gap-3">
        <h1 className="text-2xl font-bold text-foreground">{allSolved ? "🎉 Tebrikler!" : "😞 Oyun Bitti"}</h1>
        <p className="text-sm text-muted-foreground">
          {allSolved ? "Tüm seviyeleri tamamladın!" : `Doğru kelime: ${game.targetWord}`}
        </p>
        <p className="text-sm font-medium text-foreground flex items-center gap-1">
          <Timer className="w-4 h-4" /> {formatTime(game.elapsedSeconds)}
        </p>
        <div className="flex flex-col gap-1 w-full max-w-xs">
          {game.results.map((r) => (
            <div key={r.level} className="flex justify-between border-b border-border py-1 text-sm font-medium text-foreground">
              <span>{r.level} Harf</span>
              <span>{r.solved ? `${r.attempts} tahmin` : "Başarısız"}</span>
            </div>
          ))}
          <div className="flex justify-between pt-1 text-base font-bold text-foreground">
            <span>Toplam</span>
            <span>{totalAttempts} tahmin</span>
          </div>
        </div>
        <button
          onClick={game.restartGame}
          className="mt-2 px-8 py-3 rounded-full bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
        >
          Tekrar Oyna
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col items-center bg-background px-1 py-0 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between w-full max-w-lg px-2 pt-1 pb-0">
        <div className="flex flex-col">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-tight">Türkçe Wordle</h1>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground">
              Seviye {game.currentLevelIndex + 1} — {game.wordLength} Harf
            </span>
            <div className="flex gap-1">
              {game.levels.map((l, i) => (
                <div
                  key={l}
                  className={`w-1.5 h-1.5 rounded-full border transition-colors ${
                    i < game.currentLevelIndex
                      ? "bg-[hsl(142,71%,45%)] border-[hsl(142,71%,45%)]"
                      : i === game.currentLevelIndex
                      ? "bg-foreground border-foreground"
                      : "bg-background border-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {game.hintsRemaining > 0 && (
            <button
              onClick={game.useHint}
              className="flex items-center gap-0.5 px-2 py-1 rounded bg-accent text-accent-foreground text-[10px] font-bold border border-border hover:bg-muted transition-colors"
            >
              <Lightbulb className="w-3 h-3" />
              {game.hintsRemaining}
            </button>
          )}
          <span className="text-xs font-mono font-semibold text-muted-foreground flex items-center gap-0.5">
            <Timer className="w-3 h-3" />
            {formatTime(game.elapsedSeconds)}
          </span>
        </div>
      </header>

      {/* Invalid word message */}
      {game.invalidWord && (
        <p className="text-[10px] text-destructive font-medium">Geçersiz kelime!</p>
      )}

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <WordGrid
          guesses={game.guesses}
          currentGuess={game.currentGuess}
          wordLength={game.wordLength}
          maxAttempts={game.maxAttempts}
          shake={game.shake}
          bounceRow={game.bounceRow}
          revealedIndices={game.revealedIndices}
          targetWord={game.targetWord}
        />
      </div>

      {/* Keyboard */}
      <div className="w-full pb-1 pt-0.5">
        <Keyboard
          letterStates={game.letterStates}
          onKey={game.addLetter}
          onEnter={game.submitGuess}
          onBackspace={game.removeLetter}
        />
      </div>

    </div>
  );
};

export default Index;
