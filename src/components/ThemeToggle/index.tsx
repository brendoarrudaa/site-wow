import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { toggleTheme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute("data-theme") !== "wow-light");
    setMounted(true);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") !== "wow-light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return <span className={`p-2 inline-block w-8 h-8 ${className ?? ""}`} />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 ${className ?? ""}`}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};
