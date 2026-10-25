import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WindowProps = {
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  actions?: ReactNode;
  style?: React.CSSProperties;
};

export const TrafficLights = () => (
  <div className="flex items-center gap-2" aria-hidden>
    <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-inset ring-black/10" />
    <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-inset ring-black/10" />
    <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-inset ring-black/10" />
  </div>
);

const Window = ({
  title,
  children,
  className = "",
  bodyClassName = "",
  actions,
  style,
}: WindowProps) => (
  <section className={cn("window animate-window-in", className)} style={style}>
    <div className="window-titlebar">
      <TrafficLights />
      <p className="pointer-events-none absolute inset-x-24 truncate text-center text-[13px] font-medium text-foreground/70">
        {title}
      </p>
      {actions && <div className="relative ml-auto">{actions}</div>}
    </div>
    <div className={bodyClassName}>{children}</div>
  </section>
);

export default Window;
