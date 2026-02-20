import { useEffect } from "react";
import { useWordle, trUpper } from "@/hooks/useWordle";
import { useThemeContext } from "@/contexts/ThemeContext";
import WordGrid from "@/components/WordGrid";
import Keyboard from "@/components/Keyboard";
import ThemeToggle from "@/components/ThemeToggle";
import { Lightbulb, Timer, Eye, Share2 } from "lucide-react";
import { motion } from "framer-motion";

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
    const timeStr = formatTime(game.elapsedSeconds);
    const achievement = getAchievement(game.elapsedSeconds);

    const emojiGrid = game.results
      .map((r) => {
        if (!r.solved) return "❌";
        return Array.from({ length: r.attempts }, (_, i) => (i < r.attempts - 1 ? "⬜" : "🟩")).join("");
      })
      .join("\n");

    const shareText = allSolved
      ? `Wordle TR'de ${achievement.emoji} ${achievement.title} oldum! Bütün kelimeleri ${timeStr}'de bildim. Hadi gel, beni geç! 🚀\n\n${emojiGrid}`
      : `Türkçe Wordle'da ${game.results.filter((r) => r.solved).length}/${game.results.length} seviye tamamladım! 🧩\n\n${emojiGrid}`;

    const encodedText = encodeURIComponent(shareText);
    const shareUrl = encodeURIComponent(window.location.href);

    return (
      <div className="flex h-[100dvh] flex-col items-center justify-between bg-background px-4 py-4">
        <div className="flex-1 flex flex-col items-center justify-center gap-2 w-full max-w-xs">
          <h1 className="text-2xl font-bold text-foreground">{allSolved ? "🎉 Tebrikler!" : "😞 Oyun Bitti"}</h1>

          {allSolved && (
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
            <Timer className="w-4 h-4" /> {timeStr}
          </p>
          <div className="flex flex-col gap-0.5 w-full">
            {game.results.map((r) => (
              <div key={r.level} className="flex justify-between border-b border-border py-0.5 text-xs font-medium text-foreground">
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
