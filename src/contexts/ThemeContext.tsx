import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { useAccessibility } from "@/hooks/useAccessibility";

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: "light" | "dark";
  cycleTheme: () => void;
  colorBlind: boolean;
  toggleColorBlind: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { mode, resolvedTheme, cycleTheme } = useTheme();
  const { colorBlind, toggleColorBlind } = useAccessibility();

  const value = useMemo(
    () => ({ mode, resolvedTheme, cycleTheme, colorBlind, toggleColorBlind }),
    [mode, resolvedTheme, cycleTheme, colorBlind, toggleColorBlind]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
