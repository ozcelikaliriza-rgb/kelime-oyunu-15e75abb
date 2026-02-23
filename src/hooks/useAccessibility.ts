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

export function useAccessibility() {
  const [colorBlind, setColorBlind] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const applyCbVars = useCallback(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    
    if (colorBlind) {
      root.classList.add("colorblind");
      const vars = isDark ? CB_DARK : CB_LIGHT;
      Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    } else {
      root.classList.remove("colorblind");
      ["--tile-correct", "--tile-present", "--tile-absent"].forEach((k) =>
        root.style.removeProperty(k)
      );
    }
  }, [colorBlind]);

  // Sadece renk körü modu değişince çalışır
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(colorBlind));
    applyCbVars();
  }, [colorBlind, applyCbVars]);

  // Tema değişikliğini dinlemek için Observer yerine güvenli event listener
  useEffect(() => {
    window.addEventListener('storage', applyCbVars); // LocalStorage değişirse güncelle
    const timer = setInterval(applyCbVars, 1000); // Ek güvenlik: Her saniye kontrol et (donma yapmaz)
    
    return () => {
      window.removeEventListener('storage', applyCbVars);
      clearInterval(timer);
    };
  }, [applyCbVars]);

  const toggleColorBlind = useCallback(() => {
    setColorBlind((prev) => !prev);
  }, []);

  return { colorBlind, toggleColorBlind };
}
