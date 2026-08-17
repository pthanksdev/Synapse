import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/theme";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-sm">
      <Button
        size="sm"
        variant={theme === "light" ? "primary" : "ghost"}
        isIconOnly
        onClick={() => setTheme("light")}
        className="rounded-full"
      >
        <Sun className="size-4" />
      </Button>
      <Button
        size="sm"
        variant={theme === "dark" ? "primary" : "ghost"}
        isIconOnly
        onClick={() => setTheme("dark")}
        className="rounded-full"
      >
        <Moon className="size-4" />
      </Button>
    </div>
  );
}
