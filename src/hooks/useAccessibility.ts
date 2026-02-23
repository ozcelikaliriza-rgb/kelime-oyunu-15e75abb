import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wordle-colorblind";

const CB_LIGHT: Record<string, string> = {
  "--tile-correct": "24 95% 53%",
  "--tile-present": "210 79% 46%",
  "--tile-absent": "30 10% 30%",
};
const CB_DARK: Record<string, string> = {
  "--tile-correct": "24 95% 58%",
  "--tile-present": "210 79% 56%",
  "--tile-absent": "30 10% 45%",
};

function applyCbVars(enabled: boolean) {
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  if (enabled) {
    root.classList.add("colorblind");
    const vars = isDark ? CB_DARK : CB_LIGHT;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  } else {
    root.classList.remove("colorblind");
    ["--tile-correct", "--tile-present", "--tile-absent"].forEach((k) =>
      root.style.removeProperty(k)
    );
  }
}

// Module-level ref to avoid changing hook count
let _cbState = false;

export function useAccessibility() {
  const [colorBlind, setColorBlind] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  _cbState = colorBlind;

  // Apply on mount and whenever colorBlind changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(colorBlind));
    applyCbVars(colorBlind);
  }, [colorBlind]);

  // Re-apply whenever the dark class changes (theme toggle)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      applyCbVars(_cbState);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const toggleColorBlind = useCallback(() => {
    setColorBlind((v) => !v);
  }, []);

  return { colorBlind, toggleColorBlind };
}
