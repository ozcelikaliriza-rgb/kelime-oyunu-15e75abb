import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "wordle-theme";

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved === "light" || saved === "dark") return saved;
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Donmayı önleyen ve daha stabil çalışan yöntem:
    root.classList.toggle("dark", mode === "dark");
  }, [mode]);
  
  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme(mode === "light" ? "dark" : "light");
  }, [mode, setTheme]);

  return { mode, resolvedTheme: mode, setTheme, cycleTheme };
}
