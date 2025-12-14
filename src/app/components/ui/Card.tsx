"use client"

// components/ui/Card.tsx
export default function Card({
                               children,
                               className = "",
                             }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        rounded-xl
        bg-background-light dark:bg-background-dark
        shadow-sm
        ring-1 ring-black/5 dark:ring-white/10
        ${className}
      `}
    >
      {children}
    </div>
  );
}
