import DarkModeToggle from "./DarkModeToggle";

/**
 * Header
 * - 배경색 직접 지정 ❌
 * - border만 반응형으로 처리
 */
export default function Header() {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
            <div className="font-semibold">FLOCUT</div>
            <DarkModeToggle />
        </header>
    );
}
