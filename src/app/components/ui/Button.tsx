// components/ui/Button.tsx
type Variant = "primary" | "secondary";

export default function Button({
                                 children,
                                 variant = "primary",
                                 className = "",
                                 ...props
                               }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
}) {
  const base =
    "h-11 rounded-md text-sm font-medium transition-colors";

  const variants = {
    primary:
      "bg-accent text-white hover:bg-accent-hover shadow-sm",
    secondary:
      "bg-transparent border border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
