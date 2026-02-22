import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useWordle, trUpper, GameMode } from "@/hooks/useWordle";
import { useThemeContext } from "@/contexts/ThemeContext";
import WordGrid from "@/components/WordGrid";
import Keyboard from "@/components/Keyboard";
import ThemeToggle from "@/components/ThemeToggle";
import { Lightbulb, Timer, Eye, Share2, Zap, BookOpen } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const Index = () => {
  const game = useWordle();
  const { mode, cycleTheme, colorBlind, toggleColorBlind } = useThemeContext();
  const [selectedMode, setSelectedMode] = useState<GameMode>("standard");

  // Auto-focus for immediate typing
  useEffect(() => {
    window.focus();
  }, [game.currentLevelIndex]);

  // Show toast for invalid word
  useEffect(() => {
    if (game.invalidWord) {
      toast("Sözlükte bulunamadı", { duration: 1500 });
    }
  }, [game.invalidWord]);

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

  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  if (!game.gameStarted) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="home"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex min-h-screen flex-col items-center justify-center bg-background px-4 gap-8"
        >
          {/* Theme & accessibility toggles */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              onClick={toggleColorBlind}
              title="Renk körlüğü modu"
              className={`flex items-center justify-center w-7 h-7 rounded-md border transition-colors ${
                colorBlind
                  ? "bg-foreground text-background border-foreground"
                  : "bg-secondary text-secondary-foreground border-border hover:bg-muted"
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <ThemeToggle mode={mode} onCycle={cycleTheme} />
          </div>

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">KelimeBul</h1>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              4'ten 8'e kadar harfli kelimeleri tahmin et!
            </p>
          </div>

          {/* Mode selector — large buttons */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => {
                setSelectedMode("standard");
                game.startGame("standard");
              }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-foreground bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
            >
              <BookOpen className="w-5 h-5" />
              Standart Mod
            </button>
            <button
              onClick={() => {
                setSelectedMode("suddenDeath");
                game.startGame("suddenDeath");
              }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-border bg-background text-foreground text-sm font-bold tracking-wide hover:bg-muted transition-colors"
            >
              <Zap className="w-5 h-5" />
              Zamana Karşı
            </button>
            <p className="text-[10px] text-muted-foreground text-center">
              Zamana Karşı: 10 dakika, her doğru kelime +30 saniye!
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (game.gameOver) {
    const isSuddenDeath = game.gameMode === "suddenDeath";
    const allSolved = game.results.every((r) => r.solved);

    const showFailedWord = isSuddenDeath ? game.lastFailedWord || game.targetWord : !allSolved ? game.targetWord : null;

    const emojiGrid = game.results
      .map((r) => {
        if (!r.solved) return "❌";
        return Array.from({ length: r.attempts }, (_, i) => (i < r.attempts - 1 ? "⬜" : "🟩")).join("");
      })
      .join("\n");

    const solvedCount = game.results.filter((r) => r.solved).length;
    const shareText = isSuddenDeath
      ? `Wordle TR'de ${formatTime(game.elapsedSeconds)} sürede ${game.totalWordsGuessed} kelime bildim! Sen de dene:\n\n${emojiGrid}`
      : `Wordle TR'de ${formatTime(game.elapsedSeconds)} sürede ${solvedCount} kelime bildim! Sen de dene:\n\n${emojiGrid}`;

    const encodedText = encodeURIComponent(shareText);
    const shareUrl = encodeURIComponent(window.location.href);

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="results"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex h-[100dvh] flex-col items-center justify-between bg-background px-4 py-4"
        >
          <div className="flex-1 flex flex-col items-center justify-center gap-2 w-full max-w-xs">
            <h1 className="text-2xl font-bold text-foreground">
              {isSuddenDeath ? "⏱️ Süre Doldu!" : allSolved ? "🎉 Tebrikler!" : "😞 Oyun Bitti"}
            </h1>

            {/* Reveal failed word */}
            {showFailedWord && (
              <div className="flex items-center gap-2 mt-1 px-4 py-2 rounded-lg border-2 border-destructive/50 bg-destructive/10">
                <span className="text-xs text-muted-foreground">Aranan Kelime:</span>
                <span className="text-sm font-extrabold text-foreground">{showFailedWord}</span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-foreground flex items-center gap-1">
                <Timer className="w-4 h-4" /> {formatTime(game.elapsedSeconds)}
              </p>
              {isSuddenDeath && (
                <p className="text-sm font-medium text-foreground">
                  {game.totalWordsGuessed} Kelime · {game.highestLevel} Harf
                </p>
              )}
            </div>

            {/* Stats summary */}
            {!isSuddenDeath && (
              <p className="text-xs text-muted-foreground">
                {solvedCount}/{game.results.length} seviye tamamlandı
              </p>
            )}

            {/* Share buttons */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Share2 className="w-3 h-3" /> Paylaş:
              </span>
              <a
                href={`https://wa.me/?text=${encodedText}%20${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-[hsl(142,71%,45%)] text-white text-[10px] font-bold hover:opacity-90 transition-opacity"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-foreground text-background text-[10px] font-bold hover:opacity-90 transition-opacity"
              >
                X
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-[hsl(220,46%,48%)] text-white text-[10px] font-bold hover:opacity-90 transition-opacity"
              >
                Facebook
              </a>
            </div>

            <button
              onClick={game.restartGame}
              className="mt-2 px-8 py-3 rounded-full bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
            >
              Ana Menü
            </button>
          </div>

          {/* Ad placeholder */}
          <div className="w-full max-w-lg border border-border rounded-md py-2 mt-3 flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground tracking-wide">Advertisement Area</span>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const isSuddenDeath = game.gameMode === "suddenDeath";
  const timerDisplay = isSuddenDeath ? formatTime(game.remainingSeconds) : formatTime(game.elapsedSeconds);
  const timerUrgent = isSuddenDeath && game.remainingSeconds <= 60;

  return (
    <div className="relative flex h-[100dvh] flex-col items-center bg-background px-1 py-0 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between w-full max-w-lg px-2 pt-1 pb-0">
        <div className="flex flex-col">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-tight">Türkçe Wordle</h1>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground">
              {isSuddenDeath && <Zap className="w-3 h-3 inline mr-0.5" />}
              Seviye {game.currentLevelIndex + 1} — {game.wordLength} Harf
            </span>
            <div className="flex gap-1">
              {game.levels.map((l, i) => (
                <div
                  key={l}
                  className={`w-1.5 h-1.5 rounded-full border transition-colors ${
                    i < game.currentLevelIndex
                      ? "bg-[hsl(var(--tile-correct))] border-[hsl(var(--tile-correct))]"
                      : i === game.currentLevelIndex
                        ? "bg-foreground border-foreground"
                        : "bg-background border-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {(game.hintsRemaining > 0 || (game.revealedIndices.size > 0 && game.wordLength >= 7)) && (
            <button
              onClick={game.useHint}
              disabled={game.hintsRemaining <= 0}
              className={cn(
                "flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-bold border transition-colors",
                game.hintsRemaining > 0
                  ? "bg-accent text-accent-foreground border-border hover:bg-muted cursor-pointer"
                  : "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50",
              )}
            >
              <Lightbulb className="w-3 h-3" />
              {game.hintsRemaining > 0 ? `${game.hintsRemaining} Joker` : "Joker Bitti"}
            </button>
          )}
          {isSuddenDeath && (
            <span className="text-[10px] font-bold text-muted-foreground">+{game.totalWordsGuessed}</span>
          )}
          <span
            className={cn(
              "text-xs font-mono font-semibold flex items-center gap-0.5",
              timerUrgent ? "text-destructive animate-pulse" : "text-muted-foreground",
            )}
          >
            <Timer className="w-3 h-3" />
            {timerDisplay}
          </span>
          <button
            onClick={toggleColorBlind}
            title="Renk körlüğü modu"
            className={`flex items-center justify-center w-6 h-6 rounded border transition-colors ${
              colorBlind
                ? "bg-foreground text-background border-foreground"
                : "bg-secondary text-secondary-foreground border-border hover:bg-muted"
            }`}
          >
            <Eye className="w-3 h-3" />
          </button>
          <ThemeToggle mode={mode} onCycle={cycleTheme} />
        </div>
      </header>

      {/* Failed word overlay */}
      <AnimatePresence>
        {game.showingFailedWord && game.lastFailedWord && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-[hsl(45,90%,50%)] bg-card shadow-lg"
          >
            <span className="text-xs text-muted-foreground">Aranan Kelime:</span>
            <span className="text-base font-extrabold text-foreground">{game.lastFailedWord}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <WordGrid
          guesses={game.guesses}
          currentGuess={game.currentGuess}
          wordLength={game.wordLength}
          maxAttempts={game.maxAttempts}
          shake={game.shake}
          bounceRow={game.bounceRow}
          flipRow={game.flipRow}
          revealedIndices={game.revealedIndices}
          targetWord={game.targetWord}
          colorBlind={colorBlind}
        />
      </div>

      {/* Keyboard */}
      <div className="w-full pt-0.5">
        <Keyboard
          letterStates={game.letterStates}
          onKey={game.addLetter}
          onEnter={game.submitGuess}
          onBackspace={game.removeLetter}
        />
      </div>

      {/* Ad placeholder */}
      <div className="w-full max-w-lg border border-border rounded-md py-1.5 mb-1 flex items-center justify-center shrink-0">
        <span className="text-[10px] text-muted-foreground tracking-wide">Advertisement Area</span>
      </div>
    </div>
  );
};

export default Index;
