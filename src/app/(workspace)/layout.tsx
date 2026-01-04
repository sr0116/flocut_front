"use client";

import "@/app/globals.css";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthActions } from "@/hooks/useAuthActions";

import GlobalNav from "@/app/components/layout/WorkspaceLayout/GlobalNav";
import WorkspaceHeader from "@/app/components/layout/WorkspaceLayout/WorkspaceHeader";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const { user, loading } = useAuthState();
  const { ensureAuth } = useAuthActions();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    (async () => {
      const ok = await ensureAuth();
      if (!ok) {
        router.replace(`/login?from=${pathname}`);
      }
    })();
  }, [ensureAuth, pathname, router]);

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        인증 확인 중...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <WorkspaceHeader />
      <div className="flex-1 flex overflow-hidden">
        <GlobalNav
          collapsed={collapsed}
          onToggle={() => setCollapsed(prev => !prev)}
          selectedSessionId={selectedSessionId}
          onSessionSelect={(id) => setSelectedSessionId(id)}
        />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}