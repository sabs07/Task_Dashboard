"use client";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button type="button" onClick={toggleTheme} variant="secondary" aria-label="Toggle theme">
      {theme === "light" ? (
        <span role="img" aria-label="Switch to dark mode" style={{marginRight: 6}}>🌙</span>
      ) : (
        <span role="img" aria-label="Switch to light mode" style={{marginRight: 6}}>☀️</span>
      )}
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </Button>
  );
} 