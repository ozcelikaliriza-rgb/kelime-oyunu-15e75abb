import { useState, useEffect, useCallback } from "react";

export type LetterState = "correct" | "present" | "absent" | "empty";
export type GameMode = "standard" | "suddenDeath";

export interface TileData {
  letter: string;
  state: LetterState;
}

export interface LevelResult {
  level: number;
  attempts: number;
  solved: boolean;
}

const MAX_ATTEMPTS = 6;
const LEVELS = [4, 5, 6, 7, 8];
const HINTS_PER_LEVEL: Record<number, number> = { 7: 1, 8: 2 };
const SUDDEN_DEATH_START = 600; // 10 minutes
const SUDDEN_DEATH_BONUS = 30; // +30s per correct

/** Turkish-aware uppercase */
export const trUpper = (s: string) => s.toLocaleUpperCase("tr-TR");

export function useWordle() {
  const [wordLists, setWordLists] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("standard");
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<TileData[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [letterStates, setLetterStates] = useState<Record<string, LetterState>>({});
  const [levelComplete, setLevelComplete] = useState(false);
  const [levelFailed, setLevelFailed] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [results, setResults] = useState<LevelResult[]>([]);
  const [shake, setShake] = useState(false);
  const [invalidWord, setInvalidWord] = useState(false);
  const [bounceRow, setBounceRow] = useState<number | null>(null);
  const [flipRow, setFlipRow] = useState<number | null>(null);
  const [hintsRemaining, setHintsRemaining] = useState(0);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // Sudden death
  const [remainingSeconds, setRemainingSeconds] = useState(SUDDEN_DEATH_START);
  const [totalWordsGuessed, setTotalWordsGuessed] = useState(0);
  const [highestLevel, setHighestLevel] = useState(0);

  const wordLength = LEVELS[currentLevelIndex];

  useEffect(() => {
    fetch("/words.json")
      .then((r) => r.text())
      .then((text) => {
        let clean = text.trim();
        if (clean.startsWith('"') && clean.endsWith('"')) {
          clean = clean.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, "\n");
        }
        const data = JSON.parse(clean);
        setWordLists(data);
        const list = data[String(LEVELS[0])] as string[];
        const word = trUpper(list[Math.floor(Math.random() * list.length)]);
        setTargetWord(word);
        setLoading(false);
      });
  }, []);

  // Standard timer (counts up)
  useEffect(() => {
    if (!timerRunning || gameMode !== "standard") return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning, gameMode]);

  // Sudden death timer (counts down)
  useEffect(() => {
    if (!timerRunning || gameMode !== "suddenDeath") return;
    const interval = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          setGameOver(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, gameMode]);

  const pickWord = useCallback(
    (levelIdx: number) => {
      const len = LEVELS[levelIdx];
      const list = wordLists[String(len)] || [];
      return trUpper(list[Math.floor(Math.random() * list.length)]);
    },
    [wordLists]
  );

  const evaluateGuess = useCallback(
    (guess: string): TileData[] => {
      const result: TileData[] = guess.split("").map((l) => ({ letter: l, state: "absent" as LetterState }));
      const targetArr = targetWord.split("");
      const used = new Array(targetArr.length).fill(false);

      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === targetArr[i]) {
          result[i].state = "correct";
          used[i] = true;
        }
      }
      for (let i = 0; i < guess.length; i++) {
        if (result[i].state === "correct") continue;
        const idx = targetArr.findIndex((c, j) => c === guess[i] && !used[j]);
        if (idx !== -1) {
          result[i].state = "present";
          used[idx] = true;
        }
      }
      return result;
    },
    [targetWord]
  );

  const advanceLevel = useCallback((nextIdx: number) => {
    const nextLen = LEVELS[nextIdx];
    setCurrentLevelIndex(nextIdx);
    setTargetWord(pickWord(nextIdx));
    setGuesses([]);
    setCurrentGuess("");
    setLetterStates({});
    setRevealedIndices(new Set());
    setHintsRemaining(HINTS_PER_LEVEL[nextLen] || 0);
  }, [pickWord]);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== wordLength) return;

    const list = (wordLists[String(wordLength)] || []).map((w: string) => trUpper(w));
    if (!list.includes(currentGuess)) {
      setShake(true);
      setInvalidWord(true);
      if (navigator.vibrate) navigator.vibrate(100);
      setTimeout(() => { setShake(false); setInvalidWord(false); }, 600);
      return;
    }

    const evaluated = evaluateGuess(currentGuess);
    const newGuesses = [...guesses, evaluated];
    setGuesses(newGuesses);

    const newStates = { ...letterStates };
    evaluated.forEach(({ letter, state }) => {
      const prev = newStates[letter];
      if (state === "correct") newStates[letter] = "correct";
      else if (state === "present" && prev !== "correct") newStates[letter] = "present";
      else if (!prev) newStates[letter] = "absent";
    });
    setLetterStates(newStates);
    setCurrentGuess("");

    const won = currentGuess === targetWord;
    if (won) {
      setFlipRow(newGuesses.length - 1);
      setBounceRow(newGuesses.length - 1);
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      setResults((r) => [...r, { level: wordLength, attempts: newGuesses.length, solved: true }]);

      if (gameMode === "suddenDeath") {
        setRemainingSeconds((s) => s + SUDDEN_DEATH_BONUS);
        setTotalWordsGuessed((t) => t + 1);
        setHighestLevel((h) => Math.max(h, wordLength));

        // Loop: if at 8 letters, restart from 4
        const nextIdx = currentLevelIndex >= LEVELS.length - 1 ? 0 : currentLevelIndex + 1;
        setTimeout(() => {
          setFlipRow(null);
          setBounceRow(null);
          advanceLevel(nextIdx);
        }, 1200);
      } else {
        // Standard mode
        if (currentLevelIndex === LEVELS.length - 1) {
          setTimerRunning(false);
          setTimeout(() => { setFlipRow(null); setBounceRow(null); setGameOver(true); }, 1200);
        } else {
          setTimeout(() => {
            setFlipRow(null);
            setBounceRow(null);
            advanceLevel(currentLevelIndex + 1);
          }, 1200);
        }
      }
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setResults((r) => [...r, { level: wordLength, attempts: MAX_ATTEMPTS, solved: false }]);
      if (gameMode === "suddenDeath") {
        // In sudden death, failing a word = game over
        setTimerRunning(false);
        setTimeout(() => setGameOver(true), 800);
      } else {
        setTimerRunning(false);
        setTimeout(() => setGameOver(true), 800);
      }
    }
  }, [currentGuess, wordLength, wordLists, evaluateGuess, guesses, letterStates, targetWord, currentLevelIndex, pickWord, gameMode, advanceLevel]);

  const startGame = useCallback((mode: GameMode = "standard") => {
    setGameMode(mode);
    setGameStarted(true);
    setTimerRunning(true);
    if (mode === "suddenDeath") {
      setRemainingSeconds(SUDDEN_DEATH_START);
      setTotalWordsGuessed(0);
      setHighestLevel(0);
    }
  }, []);

  const restartGame = useCallback(() => {
    setCurrentLevelIndex(0);
    setTargetWord(pickWord(0));
    setGuesses([]);
    setCurrentGuess("");
    setLetterStates({});
    setLevelComplete(false);
    setLevelFailed(false);
    setGameOver(false);
    setResults([]);
    setRevealedIndices(new Set());
    setHintsRemaining(0);
    setElapsedSeconds(0);
    setRemainingSeconds(SUDDEN_DEATH_START);
    setTotalWordsGuessed(0);
    setHighestLevel(0);
    setFlipRow(null);
    setGameStarted(true);
    setTimerRunning(true);
  }, [pickWord]);

  const useHint = useCallback(() => {
    if (hintsRemaining <= 0 || !targetWord) return;
    const correctFromGuesses = new Set<number>();
    for (const g of guesses) {
      for (let i = 0; i < g.length; i++) {
        if (g[i].state === "correct") correctFromGuesses.add(i);
      }
    }
    const candidates: number[] = [];
    for (let i = 0; i < targetWord.length; i++) {
      if (!revealedIndices.has(i) && !correctFromGuesses.has(i)) candidates.push(i);
    }
    if (candidates.length === 0) return;
    const idx = candidates[Math.floor(Math.random() * candidates.length)];
    setRevealedIndices((prev) => new Set(prev).add(idx));
    setHintsRemaining((h) => h - 1);
  }, [hintsRemaining, targetWord, revealedIndices, guesses]);

  const addLetter = useCallback(
    (letter: string) => {
      if (currentGuess.length < wordLength && !levelComplete && !gameOver && !levelFailed) {
        setCurrentGuess((g) => g + letter);
      }
    },
    [currentGuess, wordLength, levelComplete, gameOver, levelFailed]
  );

  const removeLetter = useCallback(() => {
    setCurrentGuess((g) => g.slice(0, -1));
  }, []);

  return {
    loading,
    gameStarted,
    gameMode,
    wordLength,
    currentLevelIndex,
    guesses,
    currentGuess,
    letterStates,
    levelComplete,
    levelFailed,
    gameOver,
    results,
    shake,
    invalidWord,
    bounceRow,
    flipRow,
    targetWord,
    maxAttempts: MAX_ATTEMPTS,
    levels: LEVELS,
    elapsedSeconds,
    remainingSeconds,
    totalWordsGuessed,
    highestLevel,
    hintsRemaining,
    revealedIndices,
    addLetter,
    removeLetter,
    submitGuess,
    startGame,
    restartGame,
    useHint,
  };
}
