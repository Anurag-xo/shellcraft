// src/components/Terminal.tsx
import React, { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { RefreshCw } from "lucide-react"; // Removed Play, Square

interface TerminalProps {
  // code: string; // These props are likely for external sync, but internal buffer handles input
  // onCodeChange: (code: string) => void; // If needed, logic must be adjusted
  onExecute: (code: string) => Promise<{ output: string; success: boolean }>;
  className?: string;
}

export default function Terminal({
  // code,
  // onCodeChange,
  onExecute,
  className = "",
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  // Removed unused state: const [isExecuting, setIsExecuting] = useState(false);
  // Removed unused state: const [currentInput, setCurrentInput] = useState("");

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new XTerm({
      theme: {
        background: "#1a1b26",
        foreground: "#a9b1d6",
        cursor: "#f7768e",
        selection: "#33467c",
        black: "#32344a",
        red: "#f7768e",
        green: "#9ece6a",
        yellow: "#e0af68",
        blue: "#7aa2f7",
        magenta: "#ad8ee6",
        cyan: "#449dab",
        white: "#787c99",
        brightBlack: "#444b6a",
        brightRed: "#ff7a93",
        brightGreen: "#b9f27c",
        brightYellow: "#ff9e64",
        brightBlue: "#7da6ff",
        brightMagenta: "#bb9af7",
        brightCyan: "#0db9d7",
        brightWhite: "#acb0d0",
      },
      fontFamily: "JetBrains Mono, Consolas, Monaco, monospace",
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: "block",
      scrollback: 1000,
      tabStopWidth: 4,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    terminal.focus();

    terminal.writeln("\x1b[1;32m╭─ ShellCraft Terminal\x1b[0m");
    terminal.writeln(
      "\x1b[1;32m╰─\x1b[0m Type your shell commands and press Enter to execute",
    );
    terminal.write("\n\x1b[1;34muser@shellcraft\x1b[0m:\x1b[1;36m~\x1b[0m$ ");

    const inputBufferRef = useRef<string>("");
    const isExecutingRef = useRef<boolean>(false); // Track execution locally

    const writePrompt = () => {
      terminal.write("\x1b[1;34muser@shellcraft\x1b[0m:\x1b[1;36m~\x1b[0m$ ");
    };

    const executeCommand = async (command: string) => {
      if (isExecutingRef.current) return;
      isExecutingRef.current = true;

      terminal.write(`\r\n$ ${command}`);

      try {
        const result = await onExecute(command);
        if (result.output) {
          if (!result.output.startsWith("\n")) {
            terminal.write(`\r\n${result.output}`);
          } else {
            terminal.write(`${result.output}`);
          }
        }
        if (result.success === false && !result.output?.includes("Error:")) {
          terminal.write(
            `\r\n\x1b[1;31mCommand execution reported failure.\x1b[0m`,
          );
        }
      } catch (error: any) {
        console.error("Terminal execution error:", error);
        terminal.write(
          `\r\n\x1b[1;31mError: ${error.message || error.toString()}\x1b[0m`,
        );
      } finally {
        terminal.write("\r\n");
        writePrompt();
        inputBufferRef.current = "";
        isExecutingRef.current = false;
        terminal.focus();
      }
    };

    const onDataHandler = (data: string) => {
      if (isExecutingRef.current) return;

      const charCode = data.charCodeAt(0);

      if (data === "\r") {
        terminal.write("\r\n");
        const commandToExecute = inputBufferRef.current.trim();
        if (commandToExecute) {
          executeCommand(commandToExecute);
        } else {
          writePrompt();
        }
        inputBufferRef.current = "";
        return;
      }

      if (charCode === 127) {
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1);
          terminal.write("\b \b");
        }
        return;
      }

      if (charCode >= 32 && charCode <= 126) {
        inputBufferRef.current += data;
        terminal.write(data);
        // Optionally call onCodeChange(inputBufferRef.current) if external sync is needed
        // onCodeChange(inputBufferRef.current);
        return;
      }
    };

    const onDataDisposable = terminal.onData(onDataHandler);

    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      onDataDisposable.dispose();
      terminal.dispose();
    };
  }, [onExecute]); // Removed isExecuting, code, onCodeChange from deps

  const handleClear = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.writeln("\x1b[1;32m╭─ ShellCraft Terminal\x1b[0m");
      xtermRef.current.writeln(
        "\x1b[1;32m╰─\x1b[0m Type your shell commands and press Enter to execute",
      );
      xtermRef.current.write(
        "\n\x1b[1;34muser@shellcraft\x1b[0m:\x1b[1;36m~\x1b[0m$ ",
      );
      xtermRef.current.focus();
    }
  };

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-4 text-sm text-gray-400">Terminal</span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Removed onClick handler that referenced undefined handleExecute */}
          <button
            // onClick={handleExecute} // REMOVED THIS LINE
            // disabled={isExecuting} // REMOVED THIS LINE
            className="p-1 text-gray-400 hover:text-green-400 transition-colors opacity-50 cursor-not-allowed" // Visually indicate it's disabled/unused
            title="Execute via Enter key in terminal"
            aria-label="Execute command (use Enter key in terminal)"
          >
            {/* Removed conditional icon rendering for isExecuting */}
            {/* <Play className="h-4 w-4" /> */}
            {/* Placeholder icon or remove button entirely if not needed */}
            <div className="h-4 w-4"></div> {/* Or remove the button */}
          </button>
          <button
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
            title="Clear terminal"
            aria-label="Clear terminal"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={terminalRef}
        className="h-96 p-2"
        style={{ minHeight: "400px" }}
      />
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">Enter</kbd> to
        execute commands
      </div>
    </div>
  );
}
