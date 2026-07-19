import React from "react";
import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";

export default function Navbar({ showUser = false }) {
  return (
    <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-hairline">
      <Link to="/" className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-coffee text-sand font-mono text-sm font-bold">
          $_
        </span>
        <span className="font-mono text-[15px] tracking-tight font-semibold text-coffee">
          shellquest
        </span>
      </Link>
      {showUser && <UserButton afterSignOutUrl="/" />}
    </header>
  );
}
