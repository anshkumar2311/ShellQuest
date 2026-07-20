import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { API_URL } from "../lib/api.js";

export default function TerminalComponent({ onTaskComplete }) {
  const containerRef = useRef(null);
  const { getToken } = useAuth();
  const errorRef = useRef(null);

  useEffect(() => {
    let socket;
    let term;
    let disposed = false;

    async function init() {
      const token = await getToken();
      socket = io(API_URL, { auth: { token } });

      term = new XTerm({
        theme: {
          background: "#2A2018",
          foreground: "#F1E4CE",
          cursor: "#D9B15E",
        },
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 13,
        cursorBlink: true,
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      if (disposed) return;
      term.open(containerRef.current);
      fit.fit();

      term.onData((data) => socket.emit("terminal-input", data));
      socket.on("terminal-output", (data) => term.write(data));
      socket.on("task-complete", (payload) => onTaskComplete?.(payload));
      socket.on("terminal-error", (message) => {
        if (errorRef.current) errorRef.current.textContent = message;
      });

      const resizeObserver = new ResizeObserver(() => fit.fit());
      resizeObserver.observe(containerRef.current);

      return () => resizeObserver.disconnect();
    }

    let cleanupResize;
    init().then((c) => (cleanupResize = c));

    return () => {
      disposed = true;
      cleanupResize?.();
      socket?.disconnect();
      term?.dispose();
    };
  }, [getToken, onTaskComplete]);

  return (
    <div className="card-base overflow-hidden bg-[#2A2018] border-hairline/60">
      <div className="flex items-center gap-1.5 px-4 py-2 bg-[#352719] border-b border-hairline/10">
        <span className="h-2.5 w-2.5 rounded-full bg-rust" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#D9B15E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-moss" />
        <span className="ml-3 font-mono text-[11px] text-[#B8A791] font-semibold">terminal</span>
        <span ref={errorRef} className="ml-auto font-mono text-[11px] text-rust" />
      </div>
      <div className="p-3 bg-[#2A2018]">
        <div ref={containerRef} className="h-[280px]" />
      </div>
    </div>
  );
}
