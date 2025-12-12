"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import DarkModePreview from "@/app/components/DarkModePreview";

export default function HomePage() {
    const isLoggedIn = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );

    return (
        <section className="w-full">
            <div className="mx-auto max-w-5xl px-6 py-24 text-center">
                <h1 className="text-4xl font-bold leading-tight">
                    문서와 음성을,
                    <br />
                    가장 빠르게 이해하는 방법
                </h1>

                <DarkModePreview />

                <p className="mt-6 text-gray-600 dark:text-gray-400">
                    FLOCUT은 문서와 음성을 AI로 요약해
                    핵심만 남겨주는 지능형 노트 플랫폼입니다.
                </p>

                <div className="mt-10 flex justify-center gap-4">
                    {isLoggedIn ? (
                        <button className="rounded-md px-6 py-3 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
                            대시보드로 이동
                        </button>
                    ) : (
                        <>
                            <button className="rounded-md px-6 py-3 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
                                무료로 시작하기
                            </button>
                            <button className="rounded-md border px-6 py-3 border-gray-300 dark:border-neutral-700">
                                기능 둘러보기
                            </button>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
