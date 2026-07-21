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

    let socketRef = useRef(null);
    let termRef = useRef(null);

    useEffect(() => {
      let socket;
      let term;
      let disposed = false;

      async function init() {
        const token = await getToken();
        socket = io(API_URL, { auth: { token } });
        socketRef.current = socket;

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
        termRef.current = term;

        const fit = new FitAddon();
        term.loadAddon(fit);
        if (disposed) return;
        term.open(containerRef.current);
        fit.fit();

        let isConnected = false;
        socket.on("connect", () => {
          isConnected = true;
          term.write('\x1b[32m\r\nConnected to server.\x1b[0m\r\n');
        });
        socket.on("disconnect", () => {
          isConnected = false;
        });

        term.onData((data) => {
          if (isConnected) {
            socket.emit("terminal-input", data);
          }
        });
        socket.on("terminal-output", (data) => term.write(data));
        socket.on("task-complete", (payload) => onTaskComplete?.(payload));
        socket.on("terminal-error", (message) => {
          if (errorRef.current) errorRef.current.textContent = message;
        });
        socket.on("terminal-restarted", () => {
          // The backend sends this when the new container is ready.
          // We can just let the bash prompt appear.
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

    const handleRestart = () => {
      if (socketRef.current) {
        socketRef.current.emit("terminal-restart");
      }
      if (termRef.current) {
        termRef.current.clear();
        termRef.current.write('\x1b[33m\r\nRestarting terminal environment...\x1b[0m\r\n');
      }
    };

    return (
      <div className="rounded-lg overflow-hidden border border-hairline" style={{ background: "#2A2018" }}>
        <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ background: "#352719" }}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#C9694A" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#D9B15E" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#7C9A6E" }} />
          <span className="ml-3 font-mono text-[11px]" style={{ color: "#B8A791" }}>
            terminal
          </span>
          <span ref={errorRef} className="ml-auto font-mono text-[11px]" style={{ color: "#C9694A" }} />
          <button
            onClick={handleRestart}
            className="ml-4 font-mono text-[11px] px-2 py-0.5 rounded opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: "#D9B15E", border: "1px solid #D9B15E" }}
          >
            Restart
          </button>
        </div>
        <div ref={containerRef} className="p-2 h-[320px]" />
      </div>
    );
}
