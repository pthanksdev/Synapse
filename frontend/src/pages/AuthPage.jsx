import { AuthForms } from "../components/auth/AuthForms";
import { AppLogo } from "../components/AppLogo";
import { Link } from "react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "../components/ui/button";

export default function AuthPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-4 text-foreground sm:p-8 relative">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Button asChild variant="ghost" className="text-slate-500 hover:text-foreground">
          <Link to="/">
            <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </Button>
      </div>
      <div className="mb-6 flex items-center gap-3">
        <AppLogo size={44} className="rounded-xl shadow-lg" />
        <h1 className="text-3xl font-extrabold tracking-tight">Synapse</h1>
      </div>

      <AuthForms />
    </div>
  );
}
