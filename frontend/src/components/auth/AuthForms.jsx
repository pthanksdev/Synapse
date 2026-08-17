import { useState } from "react";
import { LockIcon, MailIcon, UserIcon, ArrowRightIcon, Loader2Icon } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function AuthForms() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { login, register, isLoggingIn, isSigningUp } = useAuthStore();

  const isSubmitting = isLoggingIn || isSigningUp;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "login") {
      await login({ email: formData.email, password: formData.password });
    } else {
      await register(formData);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/80 bg-background/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 rounded-xl bg-surface/60 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-lg py-2 transition-all duration-200 ${
            mode === "login"
              ? "bg-accent text-accent-foreground shadow-md"
              : "text-muted hover:text-foreground"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-lg py-2 transition-all duration-200 ${
            mode === "register"
              ? "bg-accent text-accent-foreground shadow-md"
              : "text-muted hover:text-foreground"
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          {mode === "login" ? "Welcome Back to Synapse" : "Join Synapse"}
        </h2>
        <p className="mt-1 text-xs text-muted">
          {mode === "login"
            ? "Enter your credentials to access your chats"
            : "Create your account to start real-time messaging"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                type="text"
                required
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="pl-10 h-10"
              />
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Email Address</label>
          <div className="relative">
            <MailIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              type="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10 h-10"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">Password</label>
          <div className="relative">
            <LockIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10 h-10"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full h-11"
        >
          {isSubmitting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <>
              {mode === "login" ? "Sign In" : "Create Account"}
              <ArrowRightIcon className="size-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-[11px] text-muted">
        <span>Protected by dual PostgreSQL + MongoDB secure architecture</span>
      </div>
    </div>
  );
}
