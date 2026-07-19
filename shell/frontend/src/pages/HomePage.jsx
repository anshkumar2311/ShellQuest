import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Terminal, MessageSquareCode, ListChecks, Award, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar.jsx";

const BOOT_LINES = [
  { prompt: "$", text: "whoami" },
  { prompt: ">", text: "guest@shellquest" },
  { prompt: "$", text: "cat mission.txt" },
  { prompt: ">", text: "Learn Linux by typing real commands, not watching slides." },
  { prompt: "$", text: "shellquest --start" },
];

function useTypedBoot() {
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);
  const charRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    function tick() {
      if (cancelled) return;
      const lineIdx = idxRef.current;
      if (lineIdx >= BOOT_LINES.length) {
        setDone(true);
        return;
      }
      const target = BOOT_LINES[lineIdx];
      const charIdx = charRef.current;
      setLines((prev) => {
        const next = [...prev];
        next[lineIdx] = { prompt: target.prompt, text: target.text.slice(0, charIdx) };
        return next;
      });
      if (charIdx < target.text.length) {
        charRef.current += 1;
        setTimeout(tick, 18 + Math.random() * 22);
      } else {
        idxRef.current += 1;
        charRef.current = 0;
        setTimeout(tick, 260);
      }
    }
    const start = setTimeout(tick, 400);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, []);

  return { lines, done };
}

const FEATURES = [
  { icon: Terminal, label: "01", title: "Real terminal", body: "A live shell in your browser. Every command you type actually runs." },
  { icon: MessageSquareCode, label: "02", title: "Ask the AI", body: "Stuck on a flag or a command? Ask in plain language, get a plain answer." },
  { icon: ListChecks, label: "03", title: "Daily task", body: "One new challenge each day. Solve it in the terminal, right below it." },
  { icon: Award, label: "04", title: "Badges", body: "Progress, scores, and unlocks saved to your account — visible next login." },
];

export default function HomePage() {
  const { lines, done } = useTypedBoot();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-sand text-coffee">
      <Navbar />
      <SignedIn>
        <div className="px-6 md:px-12 py-4 max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-md bg-rust text-sand px-4 py-2 text-sm font-medium hover:brightness-110 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </SignedIn>

      <section className="px-6 md:px-12 pt-10 md:pt-16 pb-16 grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
        <div>
          <p className="font-mono text-xs tracking-[0.18em] uppercase mb-4 text-rust-dark">
            /learn/linux — no slides, no video
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
            Learn Linux the way
            <br />
            you'll actually use it.
          </h1>
          <p className="mt-5 text-base leading-relaxed max-w-md text-coffee-soft">
            A real terminal, an AI that explains commands, a quiz that adapts,
            and a new task every day. Your progress is saved — come back
            tomorrow and pick up where you left off.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-md bg-coffee text-sand px-5 py-3 text-sm font-medium inline-flex items-center gap-2 hover:brightness-110 active:scale-[0.98] transition">
                  Get started <ChevronRight size={16} />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-md bg-coffee text-sand px-5 py-3 text-sm font-medium inline-flex items-center gap-2 hover:brightness-110 active:scale-[0.98] transition"
              >
                Go to Dashboard <ChevronRight size={16} />
              </button>
            </SignedIn>
            <span className="text-sm text-coffee-soft">Free to try — Clerk login</span>
          </div>
        </div>

        <div className="rounded-lg border border-hairline shadow-[0_8px_30px_rgba(59,42,30,0.15)] overflow-hidden" style={{ background: "#2A2018" }}>
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b" style={{ background: "#352719", borderColor: "#463222" }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#C9694A" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#D9B15E" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#7C9A6E" }} />
            <span className="ml-3 font-mono text-[11px]" style={{ color: "#B8A791" }}>guest@shellquest: ~</span>
          </div>
          <div className="p-5 font-mono text-[13px] leading-6 min-h-[220px]">
            {lines.map((l, i) => (
              <div key={i}>
                <span style={{ color: "#D9B15E" }}>{l.prompt} </span>
                <span style={{ color: l.prompt === ">" ? "#9FC088" : "#F1E4CE" }}>{l.text}</span>
              </div>
            ))}
            {done && (
              <div className="mt-1">
                <span style={{ color: "#D9B15E" }}>$ </span>
                <span className="inline-block w-2 h-3.5 align-middle" style={{ background: "#F1E4CE", animation: "sq-blink 1s steps(1) infinite" }} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-16 bg-sand-deep">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-mono text-xs tracking-[0.18em] uppercase mb-8 text-coffee-soft">
            inside the dashboard
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.label} className="rounded-lg border border-hairline bg-card p-5 hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <f.icon size={20} className="text-rust" />
                  <span className="font-mono text-xs text-hairline">{f.label}</span>
                </div>
                <h3 className="font-semibold text-[15px] mb-1.5">{f.title}</h3>
                <p className="text-sm leading-relaxed text-coffee-soft">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-16 text-center">
        <p className="font-mono text-sm text-coffee-soft">$ ready --to-learn</p>
        <h2 className="mt-3 text-2xl md:text-3xl font-semibold">Open a shell. Start the quest.</h2>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="mt-6 rounded-md bg-rust text-sand px-6 py-3 text-sm font-medium hover:brightness-110 active:scale-[0.98] transition">
              Get started
            </button>
          </SignInButton>
        </SignedOut>
      </section>
    </div>
  );
}
