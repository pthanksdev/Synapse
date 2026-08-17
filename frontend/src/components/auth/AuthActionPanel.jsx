import { ShieldCheckIcon, SparklesIcon } from "lucide-react";
import { AppLogo } from "../AppLogo";
import { AuthCardShell } from "./AuthCardShell";
import { AuthForms } from "./AuthForms";

const logoTileClassName = [
  "relative rounded-2xl bg-linear-to-b from-white to-[#f2f2f7] p-2",
  "shadow-lg shadow-black/8 ring-1 ring-black/8",
  "dark:from-[#2c2c2e] dark:to-[#1a1a1c] dark:shadow-black/50 dark:ring-white/12",
].join(" ");

export function AuthActionPanel() {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-12 sm:px-10 md:px-14 md:py-10 lg:px-16">
      <AuthForms />

      <div className="mt-8 flex items-center justify-center gap-2 border-t border-black/6 pt-6 text-[11px] text-[#8E8E93] dark:border-white/8 dark:text-[#636366]">
        <ShieldCheckIcon
          className="size-3.5 shrink-0 text-[#34C759] dark:text-[#30D158]"
          strokeWidth={2}
          aria-hidden
        />
        <span>Protected session · End-to-End TLS encryption</span>
      </div>
    </section>
  );
}
