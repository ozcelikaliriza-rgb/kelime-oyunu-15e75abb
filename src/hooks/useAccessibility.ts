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

  // --- BURADAN BAŞLA ---
  // Tema değişikliğini dinlemek için en güvenli yöntem:
  useEffect(() => {
    if (!colorBlind) {
      applyCbVars(false); // Mod kapalıysa her şeyi temizle
      return;
    }

    const handleClassChange = () => {
       applyCbVars(true);
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          handleClassChange();
        }
      });
    });

    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ["class"] 
    });

    return () => observer.disconnect();
  }, [colorBlind]); // Sadece colorBlind değişince efekti tazele
  // --- BURADA BİTİR ---

  const toggleColorBlind = useCallback(() => {
    setColorBlind((prev) => !prev);
  }, []);

  return { colorBlind, toggleColorBlind };
}
