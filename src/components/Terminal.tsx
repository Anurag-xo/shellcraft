import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Play, RefreshCw } from 'lucide-react';

interface TerminalProps {
  onExecute: (code: string) => Promise<{ output: string; success: boolean }>;
  className?: string;
}

export default function Terminal({ onExecute, className = '' }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new XTerm({
      theme: {
        background: '#1a1b26',
        foreground: '#a9b1d6',
        cursor: '#f7768e',
        selection: '#33467c',
        black: '#32344a',
        red: '#f7768e',
        green: '#9ece6a',
        yellow: '#e0af68',
        blue: '#7aa2f7',
        magenta: '#ad8ee6',
        cyan: '#449dab',
        white: '#787c99',
        brightBlack: '#444b6a',
        brightRed: '#ff7a93',
        brightGreen: '#b9f27c',
        brightYellow: '#ff9e64',
        brightBlue: '#7da6ff',
        brightMagenta: '#bb9af7',
        brightCyan: '#0db9d7',
        brightWhite: '#acb0d0'
      },
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 1000,
      tabStopWidth: 4
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Initialize terminal
    terminal.writeln('\x1b[1;32m╭─ ShellCraft Terminal\x1b[0m');
    terminal.writeln('\x1b[1;32m╰─\x1b[0m Type your shell commands and press Ctrl+Enter to execute');
    terminal.write('\n\x1b[1;34muser@shellcraft\x1b[0m:\x1b[1;36m~\x1b[0m$ ');

    let inputBuffer = '';

    terminal.onData((data) => {
      if (isExecuting) return;

      const code = data.charCodeAt(0);
      
      // Handle Ctrl+Enter (execute)
      if (data === '\r\n' || (data.charCodeAt(0) === 13 && data.charCodeAt(1) === 10)) {
        if (inputBuffer.trim()) {
          executeCommand(inputBuffer.trim());
          inputBuffer = '';
        } else {
          terminal.write('\n\x1b[1;34muser@shellcraft\x1b[0m:\x1b[1;36m~\x1b[0m$ ');
        }
        return;
      }

      // Handle backspace
      if (code === 127) {
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);
          terminal.write('\b \b');
        }
        return;
      }

      // Handle regular characters
      if (code >= 32 && code <= 126) {
        inputBuffer += data;
        terminal.write(data);
        
      }
    });

    const executeCommand = async (command: string) => {
      setIsExecuting(true);
      terminal.write('\n');
      
      try {
        const result = await onExecute(command);
        
        if (result.output) {
          const lines = result.output.split('\n');
          lines.forEach(line => {
            terminal.writeln(line);
          });
        }
        
        if (result.success) {
          terminal.write('\x1b[1;32m✓ Command executed successfully\x1b[0m\n');
        } else {
          terminal.write('\x1b[1;31m✗ Command failed\x1b[0m\n');
        }
      } catch (error) {
        terminal.write(`\x1b[1;31mError: ${error}\x1b[0m\n`);
      }
      
      terminal.write('\x1b[1;34muser@shellcraft\x1b[0m:\x1b[1;36m~\x1b[0m$ ');
      setIsExecuting(false);
    };

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
    };
  }, [onCodeChange, onExecute, isExecuting]);

  const handleClear = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.writeln('\x1b[1;32m╭─ ShellCraft Terminal\x1b[0m');
      xtermRef.current.writeln('\x1b[1;32m╰─\x1b[0m Type your shell commands and press Enter to execute');
      xtermRef.current.write('\n\x1b[1;34muser@shellcraft\x1b[0m:\x1b[1;36m~\x1b[0m$ ');
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
          
          <button
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
            title="Clear terminal"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div 
        ref={terminalRef} 
        className="h-96 p-2"
        style={{ minHeight: '400px' }}
      />
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">Enter</kbd> to execute commands • 
        <kbd className="px-1 py-0.5 bg-gray-700 rounded ml-1">Ctrl+C</kbd> to interrupt
      </div>
    </div>
  );
}