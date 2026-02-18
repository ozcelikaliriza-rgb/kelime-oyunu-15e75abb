import { useState, useEffect, useCallback } from "react";

export type LetterState = "correct" | "present" | "absent" | "empty";

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

/** Turkish-aware uppercase */
export const trUpper = (s: string) => s.toLocaleUpperCase("tr-TR");

export function useWordle() {
  const [wordLists, setWordLists] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
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
  const [hintsRemaining, setHintsRemaining] = useState(0);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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

  // Continuous timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

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

      // First pass: correct
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === targetArr[i]) {
          result[i].state = "correct";
          used[i] = true;
        }
      }
      // Second pass: present
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
      setBounceRow(newGuesses.length - 1);
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      setResults((r) => [...r, { level: wordLength, attempts: newGuesses.length, solved: true }]);
      if (currentLevelIndex === LEVELS.length - 1) {
        setTimerRunning(false);
        setTimeout(() => { setBounceRow(null); setGameOver(true); }, 1200);
      } else {
        setTimeout(() => {
          setBounceRow(null);
          const next = currentLevelIndex + 1;
          const nextLen = LEVELS[next];
          setCurrentLevelIndex(next);
          setTargetWord(pickWord(next));
          setGuesses([]);
          setCurrentGuess("");
          setLetterStates({});
          setRevealedIndices(new Set());
          setHintsRemaining(HINTS_PER_LEVEL[nextLen] || 0);
        }, 1000);
      }
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setResults((r) => [...r, { level: wordLength, attempts: MAX_ATTEMPTS, solved: false }]);
      setTimerRunning(false);
      setTimeout(() => setGameOver(true), 800);
    }
  }, [currentGuess, wordLength, wordLists, evaluateGuess, guesses, letterStates, targetWord, currentLevelIndex, pickWord]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setTimerRunning(true);
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
    setGameStarted(true);
    setTimerRunning(true);
  }, [pickWord]);

  const useHint = useCallback(() => {
    if (hintsRemaining <= 0 || !targetWord) return;
    // Collect positions already correct from previous guesses
    const correctFromGuesses = new Set<number>();
    if (guesses.length > 0) {
      const lastGuess = guesses[guesses.length - 1];
      for (let i = 0; i < lastGuess.length; i++) {
        if (lastGuess[i].state === "correct") correctFromGuesses.add(i);
      }
      // Check all guesses for correct positions
      for (const g of guesses) {
        for (let i = 0; i < g.length; i++) {
          if (g[i].state === "correct") correctFromGuesses.add(i);
        }
      }
    }
    // Only pick from positions not yet correct and not already revealed
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
    targetWord,
    maxAttempts: MAX_ATTEMPTS,
    levels: LEVELS,
    elapsedSeconds,
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
