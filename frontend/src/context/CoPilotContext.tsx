import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

interface CoPilotContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CoPilotContext = createContext<CoPilotContextValue | undefined>(undefined);

// Lives above <Routes> in App.tsx so the panel's open/closed state — and the
// panel component itself — survive page navigation instead of resetting
// every time AppLayout remounts on a route change.
export function CoPilotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((v) => !v),
    }),
    [isOpen]
  );

  return <CoPilotContext.Provider value={value}>{children}</CoPilotContext.Provider>;
}

export function useCoPilot() {
  const ctx = useContext(CoPilotContext);
  if (!ctx) throw new Error('useCoPilot must be used within a CoPilotProvider');
  return ctx;
}
