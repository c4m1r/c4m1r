import { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../i18n/translations';

export function Terminal() {
  const { language } = useApp();
  const t = translations[language].terminal;
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    t.welcome,
    '',
    'Type "help" for available commands.',
    '',
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    setHistory((prev) => [...prev, `$ ${cmd}`]);

    if (trimmed === 'help') {
      setHistory((prev) => [...prev, '', t.help, '']);
    } else if (trimmed === 'clear') {
      setHistory([]);
    } else if (trimmed === '') {
      setHistory((prev) => [...prev, '']);
    } else {
      setHistory((prev) => [...prev, `Command not found: ${trimmed}`, 'Type "help" for available commands.', '']);
    }

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  return (
    <div
      className="min-h-screen bg-black text-green-400 font-mono p-4"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="max-w-4xl mx-auto">
        {history.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        <div className="flex items-center">
          <span className="mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none text-green-400"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
