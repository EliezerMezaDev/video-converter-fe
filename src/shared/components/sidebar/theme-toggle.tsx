"use client";

import { useTheme } from "@providers/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Button } from "@shadcn/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={() => setTheme(isDarkMode ? "light" : "dark")}
      className="size-8 text-muted-foreground hover:text-foreground"
    >
      {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
