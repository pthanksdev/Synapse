import { Check, Palette, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { applyThemePresetToDocument, useTheme } from "../context/theme";
import { HERO_UI_THEME_PRESETS } from "../data/herouiThemePresets";
import { axiosInstance } from "../lib/axios";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export function ThemePresetPicker() {
  const { themePreset, setThemePreset } = useTheme();
  const [dbThemes, setDbThemes] = useState([]);

  useEffect(() => {
    axiosInstance.get("/themes").then((res) => {
      setDbThemes(res.data || []);
    }).catch(() => {});
  }, []);

  const handleSelect = (id) => {
    applyThemePresetToDocument(id);
    setThemePreset(id);
  };

  const handleCustomColor = (e) => {
    const color = e.target.value;
    handleSelect(color);
  };

  const isCustomColor = themePreset?.startsWith("#");

  // Merge presets with themes from DB
  const mergedThemes = [
    ...HERO_UI_THEME_PRESETS,
    ...dbThemes
      .filter((d) => !HERO_UI_THEME_PRESETS.some((p) => p.id === d.themeId))
      .map((d) => ({
        id: d.primaryColor,
        label: d.name,
        swatch: `linear-gradient(135deg, ${d.primaryColor} 0%, ${d.secondaryColor || d.primaryColor} 100%)`,
      })),
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" isIconOnly className="text-foreground">
          <Palette className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-[#2a2a2c] text-foreground border-white/10 shadow-2xl">
        <DialogHeader className="border-b border-white/10 pb-3">
          <DialogTitle className="text-lg font-semibold tracking-tight text-white">
            Accent theme
          </DialogTitle>
        </DialogHeader>

        <div className="pt-4">
          <p className="mb-4 text-sm text-zinc-400">
            Select a preset or pick your own custom color for primary actions.
          </p>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 max-h-[60vh] overflow-y-auto">
            {/* Custom Color Picker Button */}
            <label
              className={[
                "relative flex flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors cursor-pointer",
                isCustomColor
                  ? "bg-white/10 ring-2 ring-accent ring-offset-2 ring-offset-[#2a2a2c]"
                  : "hover:bg-white/6",
              ].join(" ")}
            >
              <span className="relative">
                <span
                  className="flex items-center justify-center size-14 shrink-0 rounded-full shadow-md ring-1 ring-white/20 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500"
                >
                  <PlusIcon className="size-5 text-white shadow-sm" />
                </span>
                
                <input 
                  type="color" 
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
                  value={isCustomColor ? themePreset : "#3b82f6"}
                  onChange={handleCustomColor}
                />

                {isCustomColor ? (
                  <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                ) : null}
              </span>
              <span
                className={[
                  "text-[11px] font-medium leading-tight",
                  isCustomColor ? "text-white" : "text-zinc-400",
                ].join(" ")}
              >
                Custom Color
              </span>
            </label>

            {mergedThemes.map((p) => {
              const selected = themePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p.id)}
                  className={[
                    "relative flex flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors",
                    selected
                      ? "bg-white/10 ring-2 ring-accent ring-offset-2 ring-offset-[#2a2a2c]"
                      : "hover:bg-white/6",
                  ].join(" ")}
                  aria-pressed={selected}
                >
                  <span className="relative">
                    <span
                      className="block size-14 shrink-0 rounded-full shadow-md ring-1 ring-white/20"
                      style={{ background: p.swatch }}
                    />

                    {selected ? (
                      <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={[
                      "text-[11px] font-medium leading-tight",
                      selected ? "text-white" : "text-zinc-400",
                    ].join(" ")}
                  >
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
