"use client";

import "@/app/globals.css";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuthState } from "@/hooks/useAuthState";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useMediaQuery } from "@/hooks/common/useMediaQuery";

import GlobalNav from "@/app/components/layout/WorkspaceLayout/GlobalNav";
import WorkspaceHeader from "@/app/components/layout/WorkspaceLayout/workspace/WorkspaceHeader";

export type NavMode = "full" | "icon" | "hidden";

export default function WorkspaceLayout({
                                          children,
                                        }: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { status, user } = useAuthState();
  const { ensureAuth } = useAuthActions();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const [navMode, setNavMode] = useState<NavMode>("full");
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [manualToggle, setManualToggle] = useState(false);

  const authCheckedRef = useRef(false);

  useEffect(() => {
    if (authCheckedRef.current) return;
    authCheckedRef.current = true;
    ensureAuth();
  }, [ensureAuth]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?from=${pathname}`);
    }
  }, [status, pathname, router]);

  useEffect(() => {
    if (manualToggle) return;

    if (isMobile) {
      setNavMode("hidden");
    } else if (isTablet) {
      setNavMode("icon");
    } else {
      setNavMode("full");
    }
  }, [isMobile, isTablet, manualToggle]);

  if (status === "checking") return null;
  if (status !== "authenticated" || !user) return null;

  const isModalRoute = pathname.startsWith("/settings");
  const navViewMode: "full" | "icon" = navMode === "icon" ? "icon" : "full";

  const handleManualToggle = () => {
    setManualToggle(true);
    setNavMode((prev) => (prev === "full" ? "icon" : "full"));
    setTimeout(() => setManualToggle(false), 3000);
  };

  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <WorkspaceHeader onMenuClick={() => setNavMode("full")} />
      <div className="flex flex-1 min-h-0 relative">
        {/* 모바일용 배경 오버레이 */}
        {isMobile && navMode === "full" && (
          <div
            className="fixed inset-0 top-14 z-[60] bg-black/20 backdrop-blur-sm" // 컬러를 bg-black/20 등으로 명확히 지정
            onClick={() => setNavMode("hidden")}
          />
        )}

        {navMode !== "hidden" && (
          <aside
            className={`relative flex-shrink-0 transition-all duration-300 ${
              // 모달이 뜰 때 z-index를 낮춰서 클릭되지 않게 함
              isModalRoute ? "z-0 pointer-events-none opacity-60" : "z-40"
            }`}
          >
            <GlobalNav
              mode={navViewMode}
              selectedSessionId={selectedSessionId}
              onSessionSelect={(id) => {
                if (isModalRoute) return;
                setSelectedSessionId(id);
                if (isMobile) setNavMode("hidden");
              }}
              onToggle={!isMobile ? handleManualToggle : undefined}
            />
          </aside>
        )}

        {/* 메인 영역의 z-index를 네비보다 높게 설정하여 모달이 네비를 덮도록 함 */}
        <main className="flex-1 min-w-0 min-h-0 overflow-hidden relative z-50">
          {children}
          <div id="workspace-floating-root" className="relative z-[100]" />
        </main>
      </div>
    </div>
  );
}
