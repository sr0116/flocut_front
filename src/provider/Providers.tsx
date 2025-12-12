"use client";
/**
 * ❗ 이 파일은 반드시 client component
 * 이유:
 * - Redux Provider
 * - Apollo Provider
 * - ThemeProvider
 * - Toaster
 * 전부 브라우저 상태 / context 사용
 */

import { ReactNode } from "react";

/* =========================
   Redux
========================= */

// 📌 Redux Provider는 react-redux에서 가져온다
// 이름 충돌 방지 위해 as ReduxProvider 관례적으로 사용
import { Provider as ReduxProvider } from "react-redux";

// 📌 ❗ 우리가 직접 만든 store
// ❗ 절대 next 내부 경로 쓰면 안 됨
import { store } from "@/store";

/* =========================
   Apollo (GraphQL)
========================= */

import { apolloClient } from "@/lib/apollo/clients";

/* =========================
   Theme / UI
========================= */

import { Toaster } from "sonner";
import {ThemeProvider} from "next-themes";
import {ApolloProvider} from "@apollo/client/react";

/* =========================
   Providers 컴포넌트
========================= */

/**
 * 📌 Providers
 * - layout.tsx에서 전체 앱을 감싼다
 * - 전역 상태 / 전역 기능 주입용
 */
export function Providers({ children }: { children: ReactNode }) {
    return (
        /**
         * 📌 Redux Provider
         * store를 앱 전체에 연결
         */
        <ReduxProvider store={store}>

            {/*
        📌 Apollo Provider
        GraphQL query / mutation 가능
      */}
            <ApolloProvider client={apolloClient}>

                {/*
          📌 ThemeProvider
          - attribute="class" → html class 기반 다크모드
          - enableSystem → OS 테마 연동
        */}
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    {/* 실제 페이지들 */}
                    {children}

                    {/*
            📌 Toast 알림
            - toast.success / toast.error 사용 가능
          */}
                    <Toaster position="top-right" richColors />
                </ThemeProvider>

            </ApolloProvider>
        </ReduxProvider>
    );
}
