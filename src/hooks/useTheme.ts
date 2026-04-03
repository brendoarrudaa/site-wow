import * as React from "react";

export type Theme = "dark" | "light";

const listeners: Array<(theme: Theme) => void> = [];
let currentTheme: Theme = "dark";

function dispatch(theme: Theme) {
  currentTheme = theme;
  listeners.forEach((l) => l(theme));
}

export function setTheme(theme: Theme) {
  currentTheme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {}
  document.documentElement.setAttribute("data-theme", theme);
  dispatch(theme);
}

export function toggleTheme() {
  setTheme(currentTheme === "dark" ? "light" : "dark");
}

export function useTheme() {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (document.documentElement.getAttribute("data-theme") as Theme) ?? "dark";
  });

  React.useEffect(() => {
    const domTheme = document.documentElement.getAttribute("data-theme") as Theme;
    if (domTheme && domTheme !== theme) setThemeState(domTheme);

    listeners.push(setThemeState);
    return () => {
      const idx = listeners.indexOf(setThemeState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return { theme, setTheme, toggleTheme };
}
