import { DropdownMenuGroup, DropdownMenuItem } from "@shadcn/components/ui/dropdown-menu";
import { useTheme } from "@providers/theme-provider";
import { Moon } from "lucide-react";
import { Switch } from "@shadcn/components/ui/switch";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <DropdownMenuGroup>
      <DropdownMenuItem
        className="flex items-center justify-between gap-4 cursor-pointer"
        onSelect={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4" />

          <label htmlFor="theme-switch">Modo oscuro</label>
        </div>
        <Switch
          id="theme-switch"
          checked={isDarkMode}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </DropdownMenuItem>
    </DropdownMenuGroup>
  );
}
