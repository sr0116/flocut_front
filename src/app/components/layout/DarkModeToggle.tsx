"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * 다크모드 토글 버튼
 */
export default function DarkModeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // hydration mismatch 방지
    if (!mounted) return null;

    const currentTheme = resolvedTheme ?? theme;

    return (
        <button
            onClick={() =>
                setTheme(currentTheme === "dark" ? "light" : "dark")
            }
            aria-label="toggle-theme"
        >
            {currentTheme === "dark" ? <Sun /> : <Moon />}
        </button>
    );
}
