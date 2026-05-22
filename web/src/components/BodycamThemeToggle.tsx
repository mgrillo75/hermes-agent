import { useCallback, useEffect, useState } from "react";
import { Video, VideoOff } from "lucide-react";
import { Button } from "@nous-research/ui/ui/components/button";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { useTheme } from "@/themes";

const PREVIOUS_THEME_KEY = "hermes-dashboard-previous-theme";

export function BodycamThemeToggle() {
  const { themeName, setTheme } = useTheme();
  const { t } = useI18n();
  const [previousTheme, setPreviousTheme] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(PREVIOUS_THEME_KEY);
    if (stored && stored !== "bodycam") {
      setPreviousTheme(stored);
    }
  }, []);

  const isBodycamActive = themeName === "bodycam";

  const toggle = useCallback(() => {
    if (isBodycamActive) {
      setTheme(previousTheme ?? "default");
      return;
    }

    if (themeName !== "bodycam" && typeof window !== "undefined") {
      window.localStorage.setItem(PREVIOUS_THEME_KEY, themeName);
      setPreviousTheme(themeName);
    }
    setTheme("bodycam");
  }, [isBodycamActive, previousTheme, setTheme, themeName]);

  const label = isBodycamActive ? t.theme.bodycamOff : t.theme.bodycamOn;
  const Icon = isBodycamActive ? VideoOff : Video;

  return (
    <Button
      ghost
      onClick={toggle}
      className={cn(
        "px-2 py-1 normal-case tracking-normal font-normal text-xs",
        "transition-all duration-300 ease-out",
        isBodycamActive
          ? "text-[#a43fff] hover:text-[#c56aff]"
          : "text-muted-foreground hover:text-foreground",
      )}
      title={label}
      aria-label={label}
      aria-pressed={isBodycamActive}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 transition-all duration-300",
          isBodycamActive && "animate-pulse",
        )}
        style={
          isBodycamActive
            ? { filter: "drop-shadow(0 0 4px rgba(164, 63, 255, 0.6))" }
            : undefined
        }
      />
    </Button>
  );
}
