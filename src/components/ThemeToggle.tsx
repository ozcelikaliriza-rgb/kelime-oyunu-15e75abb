import { Sun, Moon, Monitor } from "lucide-react";
import type { ThemeMode } from "@/hooks/useTheme";

const icons: Record<ThemeMode, React.ReactNode> = {
  light: <Sun className="w-4 h-4" />,
  dark: <Moon className="w-4 h-4" />,
  system: <Monitor className="w-4 h-4" />,
};

const labels: Record<ThemeMode, string> = {
  light: "Açık",
  dark: "Koyu",
  system: "Sistem",
};

export default function ThemeToggle({ mode, onCycle }: { mode: ThemeMode; onCycle: () => void }) {
  return (
    <button
      onClick={onCycle}
      title={labels[mode]}
      className="flex items-center justify-center w-7 h-7 rounded-md bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-colors"
    >
      {icons[mode]}
    </button>
  );
}
