import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}: PageHeaderProps) => (
  <div
    className={cn(
      "mb-8 flex flex-col gap-6 border-b border-border pb-8 pt-8 sm:flex-row sm:items-end sm:justify-between sm:pt-12",
      className
    )}
  >
    <div className="max-w-2xl animate-fade-up">
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h1 className="text-[2.5rem] leading-[1.05] sm:text-6xl">{title}</h1>
      {description && (
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
    </div>
    {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
