import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wordle-colorblind";

export function useAccessibility() {
  const [colorBlind, setColorBlind] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(colorBlind));
    if (colorBlind) {
      document.documentElement.classList.add("colorblind");
    } else {
      document.documentElement.classList.remove("colorblind");
    }
  }, [colorBlind]);

  const toggleColorBlind = useCallback(() => {
    setColorBlind((v) => !v);
  }, []);

  return { colorBlind, toggleColorBlind };
}
