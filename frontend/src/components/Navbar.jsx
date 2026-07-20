import React from "react";
import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { Home } from "lucide-react";

export default function Navbar({ showUser = false }) {
  return (
    <header className="flex items-center justify-between px-6 md:px-12 py-4 bg-sand border-b border-hairline/60 transition-all duration-300">
      <Link to="/" className="flex items-center gap-2.5 group">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-coffee text-sand font-mono text-sm font-bold group-hover:bg-coffee-soft transition-colors shadow-sm">
          $_
        </span>
        <span className="font-mono text-base tracking-tight font-bold text-coffee group-hover:text-coffee-soft transition-colors">
          shellquest
        </span>
      </Link>
      {showUser && (
        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-4 text-xs font-semibold font-mono">
            <Link to="/dashboard?tab=progress" className="text-coffee-soft hover:text-coffee transition-colors">
              Progress
            </Link>
            <Link to="/dashboard?tab=task" className="text-coffee-soft hover:text-coffee transition-colors">
              Tasks
            </Link>
            <Link to="/dashboard?tab=quiz" className="text-coffee-soft hover:text-coffee transition-colors">
              Quizzes
            </Link>
          </nav>

          {/* Quick Home / Hero Page Button */}
          <Link
            to="/"
            className="btn-accent text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5 shadow-xs hover:scale-[1.02] transition-transform"
          >
            <Home size={14} />
            <span>Home</span>
          </Link>

          <UserButton afterSignOutUrl="/" appearance={{
            elements: {
              avatarBox: "w-8 h-8 rounded-full border border-hairline shadow-sm hover:scale-[1.02] transition-all"
            }
          }} />
        </div>
      )}
    </header>
  );
}
