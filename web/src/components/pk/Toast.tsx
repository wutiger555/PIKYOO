"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const Ctx = createContext<(msg: string) => void>(() => {});

/** Pill toast pinned above the tab bar / sticky CTA of the app shell. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 1900);
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="toast-wrap" aria-live="polite">
        {msg && <div className="toast">{msg}</div>}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
