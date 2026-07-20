import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import {
  Terminal as TerminalIcon,
  MessageSquareCode,
  ListChecks,
  Award,
  ChevronRight,
  ChevronLeft,
  Shield,
  Check,
  Github,
  Linkedin,
  ChevronDown,
  ChevronUp,
  User,
  Coffee,
  HelpCircle,
  Flame,
  Target,
  UserPlus,
  BookOpen,
  Trophy,
  Cpu,
  Globe,
  Sparkles,
  ArrowRight,
  Smile,
  ShieldAlert,
  FolderOpen
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";

// 1. Typewriter Command Demo Scripts
const DEMO_COMMANDS = [
  { input: "whoami", output: "guest@shellquest" },
  { input: "ls -la", output: "total 8\n-rw-r--r-- 1 guest guest  45 Jul 19 12:00 greeting.txt\ndrwxr-xr-x 2 guest guest 128 Jul 19 12:00 src" },
  { input: "cat greeting.txt", output: "Welcome to ShellQuest! Learn by doing." },
  { input: "chmod +x src/script.sh", output: "Permissions updated successfully." },
];

function useTypingDemo() {
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState("");
  const [cmdIndex, setCmdIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [state, setState] = useState("typing"); // "typing", "output", "waiting"

  useEffect(() => {
    let timer;
    const cmd = DEMO_COMMANDS[cmdIndex];

    if (!cmd) {
      timer = setTimeout(() => {
        setLines([]);
        setCmdIndex(0);
        setCharIndex(0);
        setState("typing");
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (state === "typing") {
      if (charIndex < cmd.input.length) {
        timer = setTimeout(() => {
          setCurrentLine((prev) => prev + cmd.input[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, 80);
      } else {
        setState("output");
      }
    } else if (state === "output") {
      timer = setTimeout(() => {
        setLines((prev) => [
          ...prev,
          { type: "input", text: cmd.input },
          { type: "output", text: cmd.output }
        ]);
        setCurrentLine("");
        setCharIndex(0);
        setState("waiting");
      }, 400);
    } else if (state === "waiting") {
      timer = setTimeout(() => {
        setCmdIndex((prev) => prev + 1);
        setState("typing");
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [cmdIndex, charIndex, state]);

  return { lines, currentLine };
}

// 2. Features data
const FEATURES = [
  { icon: Sparkles, title: "AI Assistant Support", body: "Stuck on syntax? Our AI analyzes your inputs and answers questions inside the panel." },
  { icon: TerminalIcon, title: "Interactive Terminal", body: "A fully live Linux sandbox in your web browser. Write scripts, manage systems." },
  { icon: ListChecks, title: "Adaptive Quizzes", titleTag: "Quiz", body: "Quizzes that scale in difficulty as you answer correctly to test command knowledge." },
  { icon: Flame, title: "Daily Tasks", body: "One curated command challenge every day. Maintain streaks and earn bonus XP." },
  { icon: Award, title: "Badges Tray", body: "Gamified reward badges to display command competency and learning milestones." },
  { icon: Target, title: "Progress Tracking", body: "Log daily achievements and watch your system skills improve step-by-step." }
];

// 3. How It Works steps
const STEPS = [
  { icon: UserPlus, step: "01", title: "Sign Up", desc: "Create a free profile to track your dashboard milestones." },
  { icon: BookOpen, step: "02", title: "Learn Commands", desc: "Get curated suggestions and ask the AI chat for hints." },
  { icon: TerminalIcon, step: "03", title: "Practice Live", desc: "Type commands inside the real terminal dashboard view." },
  { icon: Trophy, step: "04", title: "Earn Badges", desc: "Complete daily milestones to unlock badges and XP." }
];

// 4. Learning Roadmap details
const ROADMAP = [
  { level: "Level 1", title: "Linux Basics", desc: "Standard prompt structures, whoami, clear, echo, and system info.", status: "completed" },
  { level: "Level 2", title: "Navigation", desc: "Traverse directories: cd, ls, pwd, mkdir, and path patterns.", status: "completed" },
  { level: "Level 3", title: "File Management", desc: "Manipulating elements: touch, cp, mv, rm, cat, and grep filters.", status: "in-progress" },
  { level: "Level 4", title: "Permissions", desc: "Security access flags: chmod, chown, sudo, groups, and files owner.", status: "locked" },
  { level: "Level 5", title: "Shell Scripting", desc: "Write variables, loops, executable flags, and automation scripts.", status: "locked" },
  { level: "Level 6", title: "Advanced Linux", desc: "Process tree (kill, ps), package setups, custom config, and background tasks.", status: "locked" }
];

// 5. Badge Showcase data
const SAMPLE_BADGES = [
  { name: "Command Commander", desc: "Run 50 correct terminal tasks.", icon: Award, colorClass: "text-rust bg-rust/10 border-rust/20" },
  { name: "Scripting Sorcerer", desc: "Write your first multiline bash loop.", icon: Sparkles, colorClass: "text-lavender-dark bg-lavender-light/20 border-lavender-soft/30" },
  { name: "Perfect Score Master", desc: "Answer 100% of questions correctly.", icon: Trophy, colorClass: "text-moss bg-moss/10 border-moss/20" }
];

// 6. Why Choose ShellQuest data
const WHY_CHOOSE_US = [
  { icon: Shield, title: "Zero Sandbox Setup", desc: "Skip virtual machine installations. Practice inside a secure environment instantly." },
  { icon: Cpu, title: "AI-Powered Tutoring", desc: "Interactive feedback answers your questions directly in the next panel." },
  { icon: Trophy, title: "Gamified Roadmap", desc: "Turn learning into play with XP scores, level checkmarks, and badges." },
  { icon: Globe, title: "In-Browser Portability", desc: "Access your terminal logs and daily tasks from any browser dashboard." },
  { icon: HelpCircle, title: "Adaptive Learning", desc: "Exercises automatically adjust based on your current knowledge base." },
  { icon: Coffee, title: "Clean Calming Design", desc: "Minimal, distraction-free interface optimized to support focus." }
];

const TEAM_MEMBERS = [
  {
    name: "Rudransh",
    role: "Backend Developer",
    bio: "Linux systems enthusiast who loves optimizing backend database performance, process management, and API endpoints.",
    img: "/team_alex.png",
    linkedin: "https://www.linkedin.com/in/rudransh28/",
    github: "https://github.com/rudraksha007"
  },
  {
    name: "Arayana",
    role: "Front End & Research",
    bio: "Passionate about creating clean, elegant learning interfaces while researching student workflows and command pedagogy.",
    img: "/team_priya.png",
    linkedin: "https://www.linkedin.com/in/arayana-sood/",
    github: "https://github.com/Arayana-sood"
  },
  {
    name: "Abhijeet",
    role: "Backend Developer",
    bio: "Obsessed with node-pty, terminal session scaling, keeping containerized sandboxes isolated, and socket connection management.",
    img: "/team_liam.png",
    linkedin: "https://www.linkedin.com/in/abhijeet-kr28/",
    github: "https://github.com/Abhijeet-ist"
  },
  {
    name: "Ansh",
    role: "Front End Developer",
    bio: "Enjoys crafting interactive animations, highly responsive terminal dashboards, and polished UI components.",
    img: "/team_marcus.png",
    linkedin: "https://www.linkedin.com/in/anshkumar2311/",
    github: "https://github.com/anshkumar2311"
  }
];

const REVIEWS = [
  {
    name: "Aarav Sharma",
    platform: "GitHub",
    avatarInitials: "AS",
    avatarBg: "bg-moss text-sand",
    text: "The AI chat tab is incredible. Whenever I get stuck on command arguments or flags, the explanation is clear and context-aware!"
  },
  {
    name: "Ananya Verma",
    platform: "LinkedIn",
    avatarInitials: "AV",
    avatarBg: "bg-rust text-sand",
    text: "Love the daily task feature! It keeps me practicing Linux every day without feeling overwhelmed. A great habit-building platform."
  },
  {
    name: "Rohan Gupta",
    platform: "Twitter",
    avatarInitials: "RG",
    avatarBg: "bg-coffee-soft text-sand",
    text: "Being able to run real commands directly in the browser with Clerk progress tracking and the 365-day heatmap is a game-changer."
  },
  {
    name: "Priyanshu Patel",
    platform: "GitHub",
    avatarInitials: "PP",
    avatarBg: "bg-lavender-dark text-sand",
    text: "The interactive terminal inside the browser paired with quiz rewards makes learning shell commands super engaging for students."
  },
  {
    name: "Kavya Nair",
    platform: "LinkedIn",
    avatarInitials: "KN",
    avatarBg: "bg-moss text-sand",
    text: "The new Progress Dashboard and downloadable PDF reports make it so easy to showcase my streak and XP achievements!"
  },
  {
    name: "Devansh Kumar",
    platform: "Twitter",
    avatarInitials: "DK",
    avatarBg: "bg-rust text-sand",
    text: "ShellQuest made Linux permission flags and scripting loop concepts crystal clear. Best platform for engineering students!"
  }
];

const FAQS = [
  {
    question: "Is ShellQuest beginner friendly?",
    answer: "Yes! ShellQuest is designed for absolute beginners. We guide you step-by-step with real terminal tasks, adaptive quizzes, and our helpful AI companion."
  },
  {
    question: "Do I need Linux installed?",
    answer: "No, you do not need anything installed. ShellQuest runs a real Linux shell environment directly in your browser."
  },
  {
    question: "Does the AI explain commands?",
    answer: "Absolutely. If you are stuck or confused by command arguments or flags, you can ask our AI Chat tab for interactive, clear explanations."
  },
  {
    question: "Is my progress saved?",
    answer: "Yes, once you sign in using our secure Clerk authentication, all your daily tasks, quiz progress, and badges are stored under your profile."
  },
  {
    question: "Can I practice writing scripts?",
    answer: "Yes. ShellQuest supports script creation and multi-line loop tests. You can configure execution flags and test standard bash controls."
  },
  {
    question: "How do I earn achievement badges?",
    answer: "Badges are automatically unlocked when you meet performance goals, such as completing daily tasks or achieving high scores on adaptive quizzes."
  }
];

export default function HomePage() {
  const { lines, currentLine } = useTypingDemo();
  const navigate = useNavigate();
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

  const nextMember = () => {
    setCurrentTeamIndex((prev) => (prev === TEAM_MEMBERS.length - 1 ? 0 : prev + 1));
  };

  const prevMember = () => {
    setCurrentTeamIndex((prev) => (prev === 0 ? TEAM_MEMBERS.length - 1 : prev - 1));
  };

  const toggleFaq = (index) => {
    setExpandedFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen w-full bg-sand text-coffee font-sans transition-all duration-300">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="px-6 md:px-12 pt-16 pb-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-meta">/learn/linux — no VM setup, no slides</p>
            <h1 className="heading-display">
              Learn Linux the way
              <br />
              you'll actually use it.
            </h1>
            <p className="text-body max-w-md">
              A real terminal, an AI that explains commands, a quiz that adapts, and a new task every day. Your progress is saved automatically.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-primary inline-flex items-center gap-2 shadow-md">
                    Get started <ChevronRight size={16} />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn-primary inline-flex items-center gap-2 shadow-md"
                >
                  Go to Dashboard <ChevronRight size={16} />
                </button>
              </SignedIn>
              <span className="text-sm text-coffee-soft font-semibold">Free to try — Clerk login</span>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-hairline/60 grid grid-cols-3 gap-2 text-coffee-soft">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Shield size={16} className="text-rust flex-shrink-0" />
                <span>Beginner friendly</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Check size={16} className="text-moss flex-shrink-0" />
                <span>No VM required</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <TerminalIcon size={16} className="text-coffee flex-shrink-0" />
                <span>Sandbox testing</span>
              </div>
            </div>
          </div>

          {/* Interactive Terminal Demo Panel */}
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-sand-deep via-hairline to-sand-deep rounded-2xl blur-lg opacity-40 group-hover:opacity-50 transition duration-1000" />
            <div className="relative rounded-2xl border border-hairline/60 shadow-md overflow-hidden bg-coffee">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-coffee-soft/30 bg-[#2f2219]">
                <span className="h-2.5 w-2.5 rounded-full bg-rust" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#D9B15E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-moss" />
                <span className="ml-3 font-mono text-[11px] text-[#B8A791]">demo@shellquest: ~</span>
              </div>
              <div className="p-6 font-mono text-[13px] leading-6 min-h-[250px] text-sand scrollbar-custom">
                {lines.map((l, i) => (
                  <div key={i} className="animate-[fadeIn_0.2s_ease-out]">
                    {l.type === "input" ? (
                      <div>
                        <span className="text-[#D9B15E]">$ </span>
                        <span>{l.text}</span>
                      </div>
                    ) : (
                      <div className="text-moss-light/80 text-xs my-1 bg-[#1e1510]/50 p-2 rounded-lg leading-relaxed whitespace-pre font-semibold">
                        {l.text}
                      </div>
                    )}
                  </div>
                ))}
                <div className="mt-1">
                  <span className="text-[#D9B15E]">$ </span>
                  <span className="text-sand">{currentLine}</span>
                  <span className="inline-block w-2 h-4 align-middle bg-sand animate-[sq-blink_1s_steps(1)_infinite]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Section */}
      <section className="px-6 md:px-12 py-20 bg-sand-deep/10 border-y border-hairline/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-meta">Features List</p>
            <h2 className="heading-section">Tools to support system mastery</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "AI Assistant Support",
                body: "Stuck on syntax? Our AI companion analyzes your input and explains concepts directly in your dashboard.",
                themeClass: "bg-lavender-light/45 border-lavender-soft/30 text-lavender-dark"
              },
              {
                icon: TerminalIcon,
                title: "Interactive Terminal",
                body: "A live Linux shell in your browser. Practice directories, permissions, and script automation instantly.",
                themeClass: "bg-sand-deep/45 border-hairline/50 text-coffee"
              },
              {
                icon: ListChecks,
                title: "Adaptive Quizzes",
                body: "Test your system memory with adaptive quiz questions that scale in difficulty as you improve.",
                themeClass: "bg-moss/10 border-moss/20 text-moss"
              },
              {
                icon: Flame,
                title: "Daily Tasks",
                body: "One curated task challenge every day. Maintain streaks, earn bonus experience points, and level up.",
                themeClass: "bg-rust/10 border-rust/20 text-rust-dark"
              },
              {
                icon: Award,
                title: "Badges Tray",
                body: "Unlock reward badges to showcase your shell proficiency milestones and commands solved.",
                themeClass: "bg-card border-hairline/60 text-coffee"
              },
              {
                icon: Target,
                title: "Progress Tracking",
                body: "Log daily achievements and watch your terminal command confidence build step-by-step.",
                themeClass: "bg-lavender-light/45 border-lavender-soft/30 text-lavender-dark"
              }
            ].map((f, idx) => {
              const IconComp = f.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-[2rem] p-6 border shadow-sm hover:scale-[1.01] hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[180px] ${f.themeClass}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-xl bg-sand/35 h-max flex-shrink-0">
                      <IconComp size={20} />
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-4">
                    <h4 className="font-bold text-sm leading-tight">{f.title}</h4>
                    <p className="text-xs opacity-90 leading-relaxed">{f.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Learning Roadmap */}
      <section id="roadmap" className="px-6 md:px-12 py-20 bg-sand-deep/10 border-b border-hairline/40">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-meta">Curriculum Journey</p>
            <h2 className="heading-section">Standard learning roadmap</h2>
          </div>
          
          {/* Timeline inside a structured card container */}
          <div className="card-base card-padding max-w-2xl mx-auto shadow-[0_8px_30px_rgba(59,42,30,0.02)]">
            <div className="space-y-10 relative border-l-2 border-hairline/60 pl-8 ml-4 sm:ml-6 py-2">
              {ROADMAP.map((r, idx) => (
                <div key={idx} className="relative animate-[fadeIn_0.3s_ease-out]">
                  {/* Dot on the timeline */}
                  <div className={`absolute -left-[39px] top-1.5 w-4 h-4 rounded-full border-2 bg-card ${
                    r.status === "completed" ? "border-moss bg-moss" :
                    r.status === "in-progress" ? "border-rust bg-rust animate-pulse" :
                    "border-hairline bg-sand-deep"
                  }`} />
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rust-dark">{r.level}</span>
                      {r.status === "completed" ? (
                        <span className="text-[9px] font-bold text-moss bg-moss/10 px-2 py-0.5 rounded-full">Completed</span>
                      ) : r.status === "in-progress" ? (
                        <span className="text-[9px] font-bold text-rust bg-rust/10 px-2 py-0.5 rounded-full">Active</span>
                      ) : (
                        <span className="text-[9px] font-bold text-coffee-soft/50 bg-sand-deep/30 px-2 py-0.5 rounded-full">Locked</span>
                      )}
                    </div>
                    <h4 className="font-bold text-base text-coffee">{r.title}</h4>
                    <p className="text-xs text-coffee-soft leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Badge Showcase */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-meta">Achievements</p>
          <h2 className="heading-section">Unlock custom reward badges</h2>
        </div>
        
        {/* Unified achievements card */}
        <div className="card-base card-padding max-w-4xl mx-auto shadow-[0_8px_30px_rgba(59,42,30,0.02)]">
          <div className="grid sm:grid-cols-3 gap-8">
            {SAMPLE_BADGES.map((b, idx) => {
              const BadgeIcon = b.icon;
              return (
                <div key={idx} className="text-center space-y-3 group">
                  <div className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-105 ${b.colorClass} shadow-sm`}>
                    <BadgeIcon size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-coffee">{b.name}</h4>
                    <p className="text-xs text-coffee-soft leading-relaxed max-w-[220px] mx-auto">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Why Choose ShellQuest */}
      <section id="why-choose" className="px-6 md:px-12 py-20 bg-sand-deep/10 border-y border-hairline/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-meta">Comparison</p>
            <h2 className="heading-section">Why learn with ShellQuest?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_CHOOSE_US.map((w, idx) => (
              <div key={idx} className="card-base card-padding rounded-[2rem] flex gap-4 items-start hover:scale-[1.01] hover:shadow-md transition-all duration-300 group">
                <div className="p-2.5 rounded-xl bg-sand-deep/40 text-rust mt-0.5 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <w.icon size={16} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-coffee">{w.title}</h4>
                  <p className="text-xs text-coffee-soft leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Meet Our Team Section */}
      <section id="team" className="px-6 md:px-12 py-24 text-coffee border-b border-hairline/60">
        <div className="max-w-6xl mx-auto space-y-12 text-center">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="heading-section">Meet Our Team</h2>
            <p className="text-body max-w-3xl mx-auto">
              The creative forces driving ShellQuest, uniting technical expertise, education design, and a shared passion for making Linux accessible and fun to learn.
            </p>
          </div>

          {/* Featured Team Member Layout */}
          <div className="relative max-w-4xl mx-auto pt-8">
            <div
              key={currentTeamIndex}
              className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-10 md:gap-16 animate-[fadeIn_0.5s_ease-out]"
            >
              {/* Left Side: Large Profile Image */}
              <div className="w-64 h-64 md:w-80 md:h-80 flex-shrink-0 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(59,42,30,0.06)] border border-hairline/60 bg-card">
                <img
                  src={TEAM_MEMBERS[currentTeamIndex].img}
                  alt={TEAM_MEMBERS[currentTeamIndex].name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right Side: Details & Controls */}
              <div className="flex-1 flex flex-col justify-between self-stretch text-left">
                <div className="space-y-4">
                  <div>
                    <h3 className="heading-section text-coffee">{TEAM_MEMBERS[currentTeamIndex].name}</h3>
                    <p className="text-sm md:text-base font-semibold text-rust mt-1 font-mono uppercase tracking-wide">
                      {TEAM_MEMBERS[currentTeamIndex].role}
                    </p>
                  </div>
                  <p className="text-body mt-6 max-w-xl">{TEAM_MEMBERS[currentTeamIndex].bio}</p>
                </div>

                <div className="pt-8 space-y-5">
                  {/* Social Links */}
                  <div className="flex items-center gap-3.5 text-coffee-soft">
                    <a
                      href={TEAM_MEMBERS[currentTeamIndex].linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-coffee transition-colors"
                      aria-label={`${TEAM_MEMBERS[currentTeamIndex].name} LinkedIn`}
                    >
                      <Linkedin size={20} />
                    </a>
                    <a
                      href={TEAM_MEMBERS[currentTeamIndex].github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-coffee transition-colors"
                      aria-label={`${TEAM_MEMBERS[currentTeamIndex].name} GitHub`}
                    >
                      <Github size={20} />
                    </a>
                  </div>

                  {/* Slider Navigation Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={prevMember}
                      className="w-10 h-10 rounded-full bg-coffee text-sand flex items-center justify-center hover:bg-coffee-soft transition-all shadow-md active:scale-95"
                      aria-label="Previous team member"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextMember}
                      className="w-10 h-10 rounded-full bg-coffee text-sand flex items-center justify-center hover:bg-coffee-soft transition-all shadow-md active:scale-95"
                      aria-label="Next team member"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. User Reviews Section */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-meta">/testimonials</p>
          <h2 className="heading-section">What students say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((review, idx) => (
            <div
              key={idx}
              className="card-base card-padding hover:shadow-[0_8px_30px_rgba(92,122,82,0.06)] hover:border-moss/40 transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <p className="text-sm leading-relaxed text-coffee-soft italic">"{review.text}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-hairline/40">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono ${review.avatarBg}`}>
                  {review.avatarInitials}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-coffee">{review.name}</h4>
                  <span className="text-meta text-[10px]">{review.platform}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12. FAQ Accordion Section */}
      <section id="faq" className="px-6 md:px-12 py-20 bg-sand-deep/20 border-t border-hairline/40">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-meta">/support</p>
            <h2 className="heading-section">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isExpanded = expandedFaqIndex === idx;
              return (
                <div key={idx} className="card-base overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-coffee hover:bg-sand-deep/20 transition-colors focus-ring"
                  >
                    <span>{faq.question}</span>
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-rust flex-shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-coffee-soft flex-shrink-0" />
                    )}
                  </button>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isExpanded ? "max-h-40 border-t border-hairline/30" : "max-h-0"
                    }`}
                  >
                    <p className="px-6 py-4 text-sm text-coffee-soft leading-relaxed bg-sand/20">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 13. Final Call-to-Action */}
      <section className="px-6 md:px-12 py-24 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="heading-section">Ready to Start Your Linux Journey?</h2>
        <p className="text-body max-w-lg mx-auto">
          Start practicing real commands, solve challenges, earn custom milestone badges, and build terminal confidence today.
        </p>
        <div className="pt-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-accent px-8 py-4 shadow-md inline-flex items-center gap-2">
                Get Started <ChevronRight size={18} />
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-accent px-8 py-4 shadow-md inline-flex items-center gap-2"
            >
              Go to Dashboard <ChevronRight size={18} />
            </button>
          </SignedIn>
        </div>
      </section>

      {/* Refined Footer */}
      <footer className="bg-card text-coffee border-t border-hairline/60 px-6 md:px-12 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-coffee text-sand font-mono text-sm font-bold">
                $_
              </span>
              <span className="font-mono text-lg tracking-tight font-bold text-coffee">shellquest</span>
            </div>
            <p className="text-sm text-coffee-soft max-w-sm leading-relaxed">
              An interactive terminal platform designed to help students master Linux commands, write bash scripts, and build core terminal confidence.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-meta text-rust">Navigation</h4>
            <ul className="space-y-2 text-sm text-coffee-soft">
              <li>
                <a href="#why-choose" className="hover:text-coffee transition-colors">About ShellQuest</a>
              </li>
              <li>
                <a href="#team" className="hover:text-coffee transition-colors">Meet the Team</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-coffee transition-colors">FAQ</a>
              </li>
              <li>
                <SignedIn>
                  <button onClick={() => navigate("/dashboard")} className="hover:text-coffee transition-colors text-left">Dashboard</button>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="hover:text-coffee transition-colors text-left">Dashboard</button>
                  </SignInButton>
                </SignedOut>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-meta text-rust">Connect & Legal</h4>
            <ul className="space-y-2 text-sm text-coffee-soft">
              <li>
                <a href="#" className="hover:text-coffee transition-colors inline-flex items-center gap-1.5">
                  <Github size={14} /> GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-coffee transition-colors inline-flex items-center gap-1.5">
                  <Linkedin size={14} /> LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-coffee transition-colors">Contact Support</a>
              </li>
              <li>
                <a href="#" className="hover:text-coffee transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-hairline/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-coffee-soft">
          <span>&copy; {new Date().getFullYear()} ShellQuest. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with <Coffee size={12} className="text-rust" /> by the ShellQuest team
          </span>
        </div>
      </footer>
    </div>
  );
}
