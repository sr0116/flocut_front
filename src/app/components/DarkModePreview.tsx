"use client";

export default function DarkModePreview() {
    return (
        <div
            className="
                mt-16 mx-auto max-w-xl rounded-xl border p-6 text-center
                bg-white border-gray-200 text-gray-900
                dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-100
            "
        >
            <h3 className="text-lg font-semibold">
                다크모드 테스트 컴포넌트
            </h3>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                이 박스는 메인 페이지와 별개로
                다크모드 반응만 확인하기 위한 컴포넌트입니다.
            </p>

            <div className="mt-4 flex justify-center gap-3">
                <button
                    className="
                        rounded-md px-4 py-2 text-sm
                        bg-gray-900 text-white
                        dark:bg-gray-100 dark:text-gray-900
                    "
                >
                    Primary
                </button>

                <button
                    className="
                        rounded-md border px-4 py-2 text-sm
                        border-gray-300 text-gray-700
                        dark:border-neutral-600 dark:text-gray-300
                    "
                >
                    Secondary
                </button>
            </div>
        </div>
    );
}
