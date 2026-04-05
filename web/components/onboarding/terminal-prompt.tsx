export function TerminalPrompt({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-sm text-[#c5ff4a]/90">
      <span className="select-none text-zinc-600">$ </span>
      {children}
    </p>
  );
}
