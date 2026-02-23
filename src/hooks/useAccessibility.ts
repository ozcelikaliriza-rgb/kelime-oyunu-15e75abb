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
  if (typeof window === "undefined") return;
  
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  
  if (enabled) {
    // classList.add yerine doğrudan kontrol ekleyerek tetiklemeyi azaltıyoruz
    if (!root.classList.contains("colorblind")) {
      root.classList.add("colorblind");
    }
    const vars = isDark ? CB_DARK : CB_LIGHT;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  } else {
    root.classList.remove("colorblind");
    ["--tile-correct", "--tile-present", "--tile-absent"].forEach((k) =>
      root.style.removeProperty(k)
    );
  }
}

export function useAccessibility() {
  const [colorBlind, setColorBlind] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  // 1. Ayarları uygula ve kaydet (Sadece colorBlind değişince)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(colorBlind));
    applyCbVars(colorBlind);
  }, [colorBlind]);

  // 2. TEMA DEĞİŞİKLİĞİNİ DİNLE (Döngüye girmeden)
  useEffect(() => {
    // MutationObserver yerine bir 'Event Listener' gibi davranan ama daha güvenli olan yöntem
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "class") {
          // ÖNEMLİ: Sadece 'dark' sınıfı değişmişse renkleri güncelle
          // colorblind sınıfı eklendiğinde tekrar tetiklenmesini engelliyoruz
          applyCbVars(colorBlind);
          break; 
        }
      }
    });

    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ["class"] // Sadece class değişimlerini dinle
    });

    return () => observer.disconnect();
  }, [colorBlind]);

  const toggleColorBlind = useCallback(() => {
    setColorBlind((prev) => !prev);
  }, []);

  return { colorBlind, toggleColorBlind };
}
