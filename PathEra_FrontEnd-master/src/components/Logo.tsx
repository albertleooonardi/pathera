import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const LogoMark = ({ className = "" }: { className?: string }) => (
  <span
    className={cn(
      "relative flex h-8 w-8 items-center justify-center rounded-full bg-mariner-950 text-white ring-1 ring-inset ring-white/10",
      className
    )}
  >
    <svg viewBox="0 0 24 24" fill="none" className="h-[52%] w-[52%]" aria-hidden>
      <circle cx="6" cy="18" r="2" fill="currentColor" />
      <circle cx="18" cy="6" r="2" fill="currentColor" />
      <path
        d="M6 16V12a3 3 0 0 1 3-3h6a3 3 0 0 0 3-3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  </span>
);

const Logo = ({ className = "" }: { className?: string }) => (
  <Link
    to="/"
    className={cn("flex items-center gap-2.5", className)}
    aria-label="PathEra home"
  >
    <LogoMark />
    <span className="font-display text-xl tracking-tight">PathEra</span>
  </Link>
);

export default Logo;
