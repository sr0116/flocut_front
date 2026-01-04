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

  const { user, loading, initialized } = useAuthState();
  const { ensureAuth } = useAuthActions();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    ensureAuth();
  }, [ensureAuth]);

  // 아직 인증 확인 자체가 끝나지 않음
  if (!initialized || loading) {
    return null; // 여기서 아무것도 렌더링하지 않음
  }

  // 인증 확인은 끝났는데, 유저가 없음 → 로그인
  if (!user) {
    router.replace(`/login?from=${pathname}`);
    return null;
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