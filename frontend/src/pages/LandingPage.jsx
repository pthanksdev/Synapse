import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { AppLogo } from "../components/AppLogo";
import { Button } from "../components/ui/button";
import {
  ShieldCheckIcon,
  ZapIcon,
  GlobeIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  LockIcon,
  KeyIcon,
  CheckCircle2Icon,
  SparklesIcon,
  MessageSquareIcon,
  MicIcon,
  ActivityIcon,
  UsersIcon,
  SendIcon,
  CheckCheckIcon,
  ShieldIcon,
  RadioIcon,
  LayersIcon,
} from "lucide-react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' | 'audio' | 'security'
  const [billingCycle, setBillingCycle] = useState("annual"); // 'monthly' | 'annual'
  
  // Interactive Hero Chat Demo state
  const [demoInput, setDemoInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "Sarah Chen", text: "Hey team! The new E2EE protocol is live on staging.", time: "10:42 AM", isMe: false, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
    { id: 2, sender: "You", text: "Awesome! Checking the latency metrics right now.", time: "10:43 AM", isMe: true, status: "read" },
    { id: 3, sender: "Alex Rivera", text: "Sub-20ms roundtrip globally. Perfect.", time: "10:44 AM", isMe: false, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
  ]);

  // E2EE Interactive Demo state
  const [plainText, setPlainText] = useState("Deploying Synapse v2.4 to production");
  
  // Audio playback state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simple hashing simulator for E2EE live demo
  const getSimulatedCipher = (str) => {
    if (!str) return "0x0000000000000000";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    return `enc_aes256_${hex}_${btoa(str.slice(0, 8))}`;
  };

  const handleSendDemoMessage = (e) => {
    e.preventDefault();
    if (!demoInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: "You",
      text: demoInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: "sent"
    };
    setMessages((prev) => [...prev, newMsg]);
    setDemoInput("");

    // Auto reply simulation
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "Synapse Bot",
          text: "⚡ Message received and encrypted end-to-end!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
          avatar: "/logo.png"
        }
      ]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200 antialiased">
      {/* Sticky Header with Glassmorphism */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0A0D14]/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/40 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 max-w-6xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <AppLogo size={34} className="rounded-lg transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                Synapse <span className="text-[10px] font-semibold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">v2.4</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Button
              asChild
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg px-4 py-2 text-sm shadow-md shadow-cyan-500/15 transition-all active:scale-[0.98]"
            >
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative pt-28 md:pt-36">
        {/* HERO SECTION */}
        <section className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Synapse Enterprise Platform is now live</span>
              <ArrowRightIcon className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.15] mb-6">
              Real-time messaging built for teams who move fast.
            </h1>

            <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-normal mb-8">
              End-to-end encryption, multi-device instant sync, voice waveforms, and real-time administrative control — packed into one fluid, zero-latency interface.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg px-6 py-3 text-base shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
              >
                <Link to="/auth" className="flex items-center gap-2">
                  Start Chatting Now <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-200 font-medium rounded-lg px-6 py-3 text-base active:scale-[0.98] transition-all"
              >
                <a href="#interactive-demo">Try Live Sandbox</a>
              </Button>
            </div>

            <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1"><CheckCircle2Icon className="w-3.5 h-3.5 text-cyan-500" /> 100% Free & Open Platform</span>
              <span className="flex items-center gap-1"><CheckCircle2Icon className="w-3.5 h-3.5 text-cyan-500" /> No credit card required</span>
            </p>
          </div>

          {/* INTERACTIVE HERO DEMO CARD */}
          <div id="interactive-demo" className="scroll-mt-32 max-w-4xl mx-auto rounded-xl border border-slate-800 bg-[#0F141C] shadow-2xl overflow-hidden">
            {/* Window Bar */}
            <div className="bg-[#141A24] px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-500 flex items-center gap-1">
                  <LockIcon className="w-3 h-3 text-emerald-400" /> e2ee://synapse.internal/session-904
                </span>
              </div>
              <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800/80">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    activeTab === "chat" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Messaging
                </button>
                <button
                  onClick={() => setActiveTab("audio")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    activeTab === "audio" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Voice Notes
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    activeTab === "security" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Encryption Vault
                </button>
              </div>
            </div>

            {/* Demo Body */}
            <div className="p-4 md:p-6 min-h-[340px] flex flex-col justify-between">
              {activeTab === "chat" && (
                <div className="flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3 overflow-y-auto max-h-[240px] pr-2">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex gap-3 text-sm ${m.isMe ? "justify-end" : "justify-start"}`}
                      >
                        {!m.isMe && (
                          <img src={m.avatar} alt={m.sender} className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
                        )}
                        <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                          m.isMe
                            ? "bg-cyan-500 text-slate-950 font-medium rounded-tr-none shadow-sm"
                            : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none"
                        }`}>
                          {!m.isMe && <div className="text-[11px] font-semibold text-cyan-400 mb-0.5">{m.sender}</div>}
                          <div>{m.text}</div>
                          <div className={`text-[10px] mt-1 text-right ${m.isMe ? "text-slate-900/70" : "text-slate-500"}`}>
                            {m.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendDemoMessage} className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <input
                      type="text"
                      placeholder="Type an interactive demo message..."
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      className="flex-1 bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                    <Button type="submit" size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2.5">
                      <SendIcon className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              )}

              {activeTab === "audio" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <MicIcon className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-base font-semibold text-white">Live Voice Note Waveform Visualizer</h4>
                    <p className="text-xs text-slate-400 mt-1">Opus compressed @ 48kHz with low latency playback</p>
                  </div>

                  {/* Waveform visual */}
                  <div className="w-full max-w-md bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-transform active:scale-95"
                    >
                      {isPlayingAudio ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div className="flex-1 flex items-center gap-1 h-8">
                      {[40, 65, 30, 85, 95, 45, 60, 75, 50, 90, 100, 70, 40, 80, 60, 90, 45, 30, 70, 85, 60, 40].map((h, idx) => (
                        <div
                          key={idx}
                          style={{ height: `${h}%` }}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            idx * 4.5 <= audioProgress ? "bg-cyan-400" : "bg-slate-800"
                          } ${isPlayingAudio ? "animate-pulse" : ""}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-slate-400">0:14</span>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-4 py-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
                    <KeyIcon className="w-4 h-4" /> Live AES-256 Client Cipher Simulator
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Plaintext Input:</label>
                    <input
                      type="text"
                      value={plainText}
                      onChange={(e) => setPlainText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Encrypted Payload Output (sent over websocket):</label>
                    <div className="w-full bg-[#07090E] border border-slate-800/90 rounded-lg p-3 text-xs font-mono text-emerald-400 break-all">
                      {getSimulatedCipher(plainText)}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" /> Keys are derived client-side. Server never sees raw messages.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* LOGO STRIP / TRUST MARQUEE */}
        <section className="py-16 border-y border-slate-800/60 bg-[#080B10] mt-24">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500 mb-8">
              Engineered for reliability & scale
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-70">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-sm tracking-widest">
                <GlobeIcon className="w-5 h-5 text-cyan-400" /> WEBRTC MESH
              </div>
              <div className="flex items-center gap-2 text-slate-300 font-bold text-sm tracking-widest">
                <RadioIcon className="w-5 h-5 text-cyan-400" /> SOCKET.IO REALTIME
              </div>
              <div className="flex items-center gap-2 text-slate-300 font-bold text-sm tracking-widest">
                <ShieldIcon className="w-5 h-5 text-cyan-400" /> PRISMA + PG
              </div>
              <div className="flex items-center gap-2 text-slate-300 font-bold text-sm tracking-widest">
                <LayersIcon className="w-5 h-5 text-cyan-400" /> MONGO HYBRID
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE BENTO GRID */}
        <section id="features" className="py-24 container mx-auto px-4 md:px-6 max-w-6xl scroll-mt-20">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Architecture designed for modern teams
            </h2>
            <p className="text-slate-400 text-base">
              No bloated clutter. Just high-performance messaging infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#0F141C] border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                  <ZapIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Instant Offline Outbox</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Lost connectivity? Messages queue locally in memory and automatically flush seamlessly as soon as connection restores.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/60 text-xs font-medium text-cyan-400 flex items-center gap-1">
                Zero data loss guarantee <ArrowRightIcon className="w-3 h-3" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#0F141C] border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5">
                  <ActivityIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Admin Control Telemetry</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Monitor active user sessions, rate limits, report queues, and platform telemetry from a unified management dashboard.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/60 text-xs font-medium text-violet-400 flex items-center gap-1">
                7 Sub-tab Admin Suite <ArrowRightIcon className="w-3 h-3" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#0F141C] border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Group Invite Code System</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Generate secure invite links for instant group onboarding without administrative friction or manual contact additions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/60 text-xs font-medium text-emerald-400 flex items-center gap-1">
                One-click joining <ArrowRightIcon className="w-3 h-3" />
              </div>
            </div>
          </div>
        </section>

        {/* FREE ACCESS SECTION */}
        <section id="pricing" className="py-24 bg-[#080B10] border-t border-slate-800/60 scroll-mt-20">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
            <div className="bg-[#0F141C] border border-cyan-500/30 rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6">
                <SparklesIcon className="w-3.5 h-3.5" /> Completely Free Platform
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                100% Free Forever. No Hidden Costs.
              </h2>
              <p className="text-slate-400 text-base max-w-2xl mx-auto mb-8 leading-relaxed">
                Synapse is built to empower seamless, secure collaboration for everyone. Enjoy unlimited messages, crystal-clear voice notes, end-to-end encryption, and group chats without any paywalls or per-user fees.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto mb-10">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="text-cyan-400 font-bold text-lg mb-1">Unlimited</div>
                  <div className="text-xs text-slate-400">Messages, media sharing & group chats</div>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="text-cyan-400 font-bold text-lg mb-1">Full E2EE</div>
                  <div className="text-xs text-slate-400">Military-grade security on every device</div>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="text-cyan-400 font-bold text-lg mb-1">Zero Cost</div>
                  <div className="text-xs text-slate-400">No subscriptions, ads, or hidden tiers</div>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg px-8 py-3.5 text-base shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <Link to="/auth" className="inline-flex items-center gap-2">
                  Create Your Free Account <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#06080D] py-10">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <AppLogo size={20} />
            <span className="font-semibold text-slate-300">Synapse Enterprise Platform</span>
            <span>— Realtime Engine</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>All Systems Operational</span>
          </div>

          <div>© {new Date().getFullYear()} Synapse. Crafted with design precision.</div>
        </div>
      </footer>
    </div>
  );
}
