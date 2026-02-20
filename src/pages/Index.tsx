import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useWordle, trUpper, GameMode } from "@/hooks/useWordle";
import { useThemeContext } from "@/contexts/ThemeContext";
import WordGrid from "@/components/WordGrid";
import Keyboard from "@/components/Keyboard";
import ThemeToggle from "@/components/ThemeToggle";
import { Lightbulb, Timer, Eye, Share2, Zap, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const getAchievement = (seconds: number) => {
  if (seconds < 90) return { title: "Işık Hızı", emoji: "⚡", desc: "Gözlerini bile kırpmadan bitirdin!" };
  if (seconds < 150) return { title: "Kelime Profesörü", emoji: "🧠", desc: "Sözlükler seni kıskanıyor!" };
  if (seconds < 240) return { title: "Dil Bilimci", emoji: "🧐", desc: "Her harf senin için bir oyuncak." };
  if (seconds < 360) return { title: "Sözlük Kurdu", emoji: "🐛", desc: "Kelimelerin arasında kaybolmayı seviyorsun." };
  if (seconds < 480) return { title: "Bulmaca Sever", emoji: "🧩", desc: "Sabırlı ve kararlı bir oyuncu!" };
  if (seconds < 600) return { title: "Yolun Başında", emoji: "🐣", desc: "Her usta bir zamanlar çıraktı." };
  return { title: "Keyif Adamı", emoji: "☕", desc: "Acele yok, keyifle oynuyorsun!" };
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

  if (!game.gameStarted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 gap-6">
        {/* Theme & accessibility toggles */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={toggleColorBlind}
            title="Renk körlüğü modu"
            className={`flex items-center justify-center w-7 h-7 rounded-md border transition-colors ${
              colorBlind ? "bg-foreground text-background border-foreground" : "bg-secondary text-secondary-foreground border-border hover:bg-muted"
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <ThemeToggle mode={mode} onCycle={cycleTheme} />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Türkçe Wordle</h1>
          <p className="text-sm text-muted-foreground text-center max-w-xs">4'ten 8'e kadar harfli kelimeleri tahmin et!</p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedMode("standard")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-lg border-2 text-sm font-bold transition-all",
              selectedMode === "standard"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
          >
            <BookOpen className="w-4 h-4" />
            Standart
          </button>
          <button
            onClick={() => setSelectedMode("suddenDeath")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-lg border-2 text-sm font-bold transition-all",
              selectedMode === "suddenDeath"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
          >
            <Zap className="w-4 h-4" />
            Zamana Karşı
          </button>
        </div>

        {selectedMode === "suddenDeath" && (
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            10 dakikan var! Her doğru kelime +30 saniye kazandırır. Süre bitince oyun biter.
          </p>
        )}

        <button
          onClick={() => game.startGame(selectedMode)}
          className="px-8 py-3 rounded-full bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
        >
          Oyuna Başla
        </button>
      </div>
    );
  }

  if (game.gameOver) {
    const isSuddenDeath = game.gameMode === "suddenDeath";
    const allSolved = game.results.every((r) => r.solved);
    const totalAttempts = game.results.reduce((s, r) => s + r.attempts, 0);
    const timeStr = isSuddenDeath ? formatTime(0) : formatTime(game.elapsedSeconds);
    const achievement = !isSuddenDeath ? getAchievement(game.elapsedSeconds) : null;

    const emojiGrid = game.results
      .map((r) => {
        if (!r.solved) return "❌";
        return Array.from({ length: r.attempts }, (_, i) => (i < r.attempts - 1 ? "⬜" : "🟩")).join("");
      })
      .join("\n");

    const shareText = isSuddenDeath
      ? `Zamana Karşı modunda ${game.totalWordsGuessed} kelime bildim! 🔥 En yüksek seviye: ${game.highestLevel} harf 🚀\n\n${emojiGrid}`
      : allSolved
      ? `Wordle TR'de ${achievement?.emoji} ${achievement?.title} oldum! Bütün kelimeleri ${formatTime(game.elapsedSeconds)}'de bildim. Hadi gel, beni geç! 🚀\n\n${emojiGrid}`
      : `Türkçe Wordle'da ${game.results.filter((r) => r.solved).length}/${game.results.length} seviye tamamladım! 🧩\n\n${emojiGrid}`;

    const encodedText = encodeURIComponent(shareText);
    const shareUrl = encodeURIComponent(window.location.href);

    return (
      <div className="flex h-[100dvh] flex-col items-center justify-between bg-background px-4 py-4">
        <div className="flex-1 flex flex-col items-center justify-center gap-2 w-full max-w-xs">
          <h1 className="text-2xl font-bold text-foreground">
            {isSuddenDeath ? "⏱️ Süre Doldu!" : allSolved ? "🎉 Tebrikler!" : "😞 Oyun Bitti"}
          </h1>

          {isSuddenDeath ? (
            <div className="flex flex-col items-center gap-1">
              <p className="text-lg font-extrabold text-foreground">{game.totalWordsGuessed} Kelime</p>
              <p className="text-xs text-muted-foreground">En yüksek seviye: {game.highestLevel} harf</p>
            </div>
          ) : (
            <>
              {allSolved && achievement && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                  className="flex flex-col items-center gap-0.5"
                >
                  <span className="text-3xl">{achievement.emoji}</span>
                  <h2 className="text-xl font-extrabold tracking-tight text-foreground">{achievement.title}</h2>
                  <p className="text-[11px] text-muted-foreground text-center italic">{achievement.desc}</p>
                </motion.div>
              )}
              {!allSolved && (
                <p className="text-xs text-muted-foreground text-center">
                  Doğru kelime: {game.targetWord}
                </p>
              )}
              <p className="text-sm font-medium text-foreground flex items-center gap-1">
                <Timer className="w-4 h-4" /> {formatTime(game.elapsedSeconds)}
              </p>
            </>
          )}

          <div className="flex flex-col gap-0.5 w-full">
            {game.results.map((r, i) => (
              <div key={`${r.level}-${i}`} className="flex justify-between border-b border-border py-0.5 text-xs font-medium text-foreground">
                <span>{r.level} Harf</span>
                <span>{r.solved ? `${r.attempts} tahmin` : "Başarısız"}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1 text-sm font-bold text-foreground">
              <span>Toplam</span>
              <span>{totalAttempts} tahmin</span>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Share2 className="w-3 h-3" /> Paylaş:</span>
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
            Tekrar Oyna
          </button>
        </div>

        {/* Ad placeholder */}
        <div className="w-full max-w-lg border border-border rounded-md py-2 mt-3 flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground tracking-wide">Advertisement Area</span>
        </div>
      </div>
    );
  }

  const isSuddenDeath = game.gameMode === "suddenDeath";
  const timerDisplay = isSuddenDeath ? formatTime(game.remainingSeconds) : formatTime(game.elapsedSeconds);
  const timerUrgent = isSuddenDeath && game.remainingSeconds <= 60;

  return (
    <div className="flex h-[100dvh] flex-col items-center bg-background px-1 py-0 overflow-hidden">
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
                  : "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50"
              )}
            >
              <Lightbulb className="w-3 h-3" />
              {game.hintsRemaining > 0
                ? `${game.hintsRemaining} Joker`
                : "Joker Bitti"}
            </button>
          )}
          {isSuddenDeath && (
            <span className="text-[10px] font-bold text-muted-foreground">
              +{game.totalWordsGuessed}
            </span>
          )}
          <span className={cn(
            "text-xs font-mono font-semibold flex items-center gap-0.5",
            timerUrgent ? "text-destructive animate-pulse" : "text-muted-foreground"
          )}>
            <Timer className="w-3 h-3" />
            {timerDisplay}
          </span>
          <button
            onClick={toggleColorBlind}
            title="Renk körlüğü modu"
            className={`flex items-center justify-center w-6 h-6 rounded border transition-colors ${
              colorBlind ? "bg-foreground text-background border-foreground" : "bg-secondary text-secondary-foreground border-border hover:bg-muted"
            }`}
          >
            <Eye className="w-3 h-3" />
          </button>
          <ThemeToggle mode={mode} onCycle={cycleTheme} />
        </div>
      </header>

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
