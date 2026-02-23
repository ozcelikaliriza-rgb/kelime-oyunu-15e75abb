import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wordle-colorblind";

export function useAccessibility() {
  const [colorBlind, setColorBlind] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  // Renk körü modunu uygulayan basit fonksiyon
  const applyStyles = useCallback((enabled: boolean) => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add("colorblind");
      // CSS değişkenlerini doğrudan buraya yazalım, yan dosyalara bağımlılık kalmasın
      root.style.setProperty("--tile-correct", "24 95% 53%");
      root.style.setProperty("--tile-present", "210 79% 46%");
    } else {
      root.classList.remove("colorblind");
      root.style.removeProperty("--tile-correct");
      root.style.removeProperty("--tile-present");
    }
  }, []);

  // Sadece başlangıçta ve mod değiştiğinde çalışır (DÖNGÜ YOK)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(colorBlind));
    applyStyles(colorBlind);
  }, [colorBlind, applyStyles]);

  const toggleColorBlind = useCallback(() => {
    setColorBlind((prev) => !prev);
  }, []);

  return { colorBlind, toggleColorBlind };
}
