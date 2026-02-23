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
  if (typeof window === "undefined") return; // SSR/Build güvenliği
  
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

export function useAccessibility() {
  const [colorBlind, setColorBlind] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  // Ayarları uygula ve kaydet
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(colorBlind));
    applyCbVars(colorBlind);
  }, [colorBlind]);

  // Donmayı engellemek için MutationObserver yerine daha basit bir yöntem
  // Tema değiştiğinde renkleri güncellemek için sınıf değişikliğini dinler
  useEffect(() => {
    const handleThemeChange = () => applyCbVars(colorBlind);
    
    // MutationObserver donma yapabildiği için sadece tema değişince tetiklenecek bir mekanizma
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          handleThemeChange();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [colorBlind]); // Bağımlılığa colorBlind ekledik ki güncel kalsın

  const toggleColorBlind = useCallback(() => {
    setColorBlind((prev) => !prev);
  }, []);

  return { colorBlind, toggleColorBlind };
}
