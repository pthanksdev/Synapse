import { useState, useEffect } from "react";
import { Link } from "react-router";
import { AppLogo } from "../components/AppLogo";
import { Button } from "../components/ui/button";
import { ShieldCheckIcon, ZapIcon, GlobeIcon, ArrowRightIcon } from "lucide-react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      id: "security",
      category: "Enterprise Security",
      title: "End-to-End Encryption",
      description:
        "Your data is yours. Synapse secures every message, file, and voice note with military-grade end-to-end encryption. No backdoors, no compromises.",
      icon: ShieldCheckIcon,
    },
    {
      id: "speed",
      category: "Real-time Collaboration",
      title: "Built for Speed",
      description:
        "Experience zero latency with our globally distributed WebRTC infrastructure. Instant messages, seamless voice calls, and lightning-fast media sharing.",
      icon: ZapIcon,
    },
    {
      id: "platform",
      category: "Anywhere Access",
      title: "Cross-Platform Sync",
      description:
        "Start a conversation on your desktop and finish it on your phone. Synapse syncs instantly across all your devices, with robust offline support.",
      icon: GlobeIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-cyan-500/30">
      {/* Sticky Navbar */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size={36} />
            <span className="font-bold text-xl tracking-tight text-white">Synapse</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/auth" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Button asChild className="bg-white text-slate-950 hover:bg-slate-200 rounded-full px-6 font-semibold">
              <Link to="/auth">Sign up free</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[100px] pointer-events-none opacity-50"></div>

          <div className="container mx-auto px-6 max-w-6xl relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Secure Enterprise <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
                Communication, Reimagined.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Synapse is a next-generation messaging platform designed for speed, security, and seamless collaboration. Connect your team with zero friction.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full px-8 py-6 text-lg font-bold shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(6,182,212,0.6)]">
                <Link to="/auth">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 py-6 text-lg font-semibold border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                <Link to="/auth">Book a Demo</Link>
              </Button>
            </div>

            {/* Hero Visual Mockup */}
            <div className="mt-20 mx-auto max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 transform perspective-1000 rotate-x-12 scale-95 hover:scale-100 transition-transform duration-700 ease-out">
              <img
                src="/hero-mockup.png"
                alt="Synapse Dashboard Mockup"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-900 border-y border-white/5">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Everything you need to work faster</h2>
              <p className="text-lg text-slate-400">Powerful features wrapped in a beautiful, intuitive interface.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {features.map((feature) => (
                <div key={feature.id} className="bg-slate-950/50 p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                    <feature.icon className="w-7 h-7 text-cyan-400" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2 block">
                    {feature.category}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Band Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900"></div>
          <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center bg-slate-900/80 backdrop-blur-xl border border-white/10 p-12 md:p-20 rounded-3xl shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to upgrade your team?</h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Join thousands of enterprises already using Synapse to communicate securely and efficiently.
            </p>
            <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-200 rounded-full px-10 py-7 text-xl font-bold transition-transform hover:scale-105 shadow-xl">
              <Link to="/auth" className="flex items-center gap-2">
                Start your free trial <ArrowRightIcon className="w-6 h-6" />
              </Link>
            </Button>
            <p className="mt-6 text-sm text-slate-500">No credit card required. Cancel anytime.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/10 py-12">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <AppLogo size={24} />
            <span className="font-semibold text-white">Synapse Enterprise Platform</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Synapse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
