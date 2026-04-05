"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoadingScreen } from "./LoadingScreen";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Hide loader after initial hydration
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  // Show loader briefly on route change
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <>
      <LoadingScreen visible={loading} />
      {children}
    </>
  );
}
