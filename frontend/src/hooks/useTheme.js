import { useEffect, useState } from "react"

const STORAGE_KEY = "antrooms-theme"

// Day/night, driven by a data-theme attribute on <html> that the token blocks
// in index.css key off. The OS preference only seeds the FIRST visit -- after
// that the user's explicit choice wins and is remembered.
export function useTheme() {
  const [theme, setTheme] = useState(readInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Private browsing can throw on write. Losing the preference is fine;
      // crashing the app over it is not.
    }
  }, [theme])

  return {theme, toggleTheme: () => setTheme((t) => (t === "night" ? "day" : "night"))}
}

function readInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "day" || saved === "night") return saved
  } catch {
    // Reading storage can throw too; fall through to the OS preference.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "night" : "day"
}
