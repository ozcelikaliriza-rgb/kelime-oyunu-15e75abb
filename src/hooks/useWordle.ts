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

/** Turkish-aware uppercase */
export const trUpper = (s: string) => s.toLocaleUpperCase("tr-TR");

export function useWordle() {
  const [wordLists, setWordLists] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
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
      setResults((r) => [...r, { level: wordLength, attempts: newGuesses.length, solved: true }]);
      if (currentLevelIndex === LEVELS.length - 1) {
        setTimeout(() => setGameOver(true), 1000);
      } else {
        // Auto-advance to next level after 1 second
        setTimeout(() => {
          const next = currentLevelIndex + 1;
          setCurrentLevelIndex(next);
          setTargetWord(pickWord(next));
          setGuesses([]);
          setCurrentGuess("");
          setLetterStates({});
        }, 1000);
      }
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setResults((r) => [...r, { level: wordLength, attempts: MAX_ATTEMPTS, solved: false }]);
      setTimeout(() => setLevelFailed(true), 800);
    }
  }, [currentGuess, wordLength, wordLists, evaluateGuess, guesses, letterStates, targetWord, currentLevelIndex, pickWord]);

  const nextLevel = useCallback(() => {
    const next = currentLevelIndex + 1;
    setCurrentLevelIndex(next);
    setTargetWord(pickWord(next));
    setGuesses([]);
    setCurrentGuess("");
    setLetterStates({});
    setLevelComplete(false);
    setLevelFailed(false);
  }, [currentLevelIndex, pickWord]);

  const retryLevel = useCallback(() => {
    setTargetWord(pickWord(currentLevelIndex));
    setGuesses([]);
    setCurrentGuess("");
    setLetterStates({});
    setLevelFailed(false);
  }, [currentLevelIndex, pickWord]);

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
  }, [pickWord]);

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
    targetWord,
    maxAttempts: MAX_ATTEMPTS,
    levels: LEVELS,
    addLetter,
    removeLetter,
    submitGuess,
    nextLevel,
    retryLevel,
    restartGame,
  };
}
