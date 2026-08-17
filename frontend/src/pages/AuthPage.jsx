import { AuthForms } from "../components/auth/AuthForms";
import { AppLogo } from "../components/AppLogo";

export default function AuthPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-4 text-foreground sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <AppLogo size={44} className="rounded-xl shadow-lg" />
        <h1 className="text-3xl font-extrabold tracking-tight">Synapse</h1>
      </div>

      <AuthForms />
    </div>
  );
}
