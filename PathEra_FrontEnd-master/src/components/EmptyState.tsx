import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  tone?: "neutral" | "error";
  className?: string;
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
  className = "",
}: EmptyStateProps) => (
  <div
    role={tone === "error" ? "alert" : undefined}
    className={cn(
      "flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center",
      tone === "error" ? "border-destructive/30 bg-destructive/[0.03]" : "border-border",
      className
    )}
  >
    <span
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl",
        tone === "error"
          ? "bg-destructive/10 text-destructive"
          : "bg-mariner-50 text-mariner-600"
      )}
    >
      <Icon size={20} />
    </span>
    <p className="mt-4 font-display text-2xl">{title}</p>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
  </div>
);

export default EmptyState;
