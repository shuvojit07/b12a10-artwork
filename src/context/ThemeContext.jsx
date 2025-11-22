// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch (e) {
      console.error("Error reading theme from localStorage:", e);
      return "light";
    }
  });

  useEffect(() => {
    try {
      // DaisyUI uses data-theme on <html>
      document.documentElement.setAttribute("data-theme", theme);

      // Also sync a `dark` class for Tailwind `dark:` utilities (and general compatibility)
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      localStorage.setItem("theme", theme);
    } catch (e) {
      console.error("Error applying theme:", e);
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
