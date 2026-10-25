import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const AiAvatar = ({ className = "" }: { className?: string }) => (
  <div
    className={cn(
      "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-mariner-700 ring-1 ring-mariner-100 shadow-sm",
      className
    )}
    aria-hidden
  >
    <Sparkles size={16} strokeWidth={1.5} />
  </div>
);

export default AiAvatar;
