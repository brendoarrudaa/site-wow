import * as React from "react";

export type Theme = "wow-dark" | "wow-light";

const listeners: Array<(theme: Theme) => void> = [];
let currentTheme: Theme = "wow-dark";

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
  setTheme(currentTheme === "wow-dark" ? "wow-light" : "wow-dark");
}

export function useTheme() {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "wow-dark";
    return (document.documentElement.getAttribute("data-theme") as Theme) ?? "wow-dark";
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
