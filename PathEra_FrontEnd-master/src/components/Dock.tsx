import { Link, useLocation } from "react-router-dom";
import { AppType } from "@/config/apps";
import { cn } from "@/lib/utils";

export const AppTile = ({
  app,
  size = "lg",
}: {
  app: AppType;
  size?: "sm" | "lg";
}) => (
  <span
    className={cn(
      "flex items-center justify-center bg-gradient-to-b shadow-tile ring-1 ring-inset ring-black/[0.07] transition-transform duration-300",
      size === "lg" ? "h-14 w-14 rounded-[18px]" : "h-10 w-10 rounded-xl",
      app.tile
    )}
  >
    <app.icon size={size === "lg" ? 22 : 17} strokeWidth={1.5} />
  </span>
);

/** Vertical column of app icons on the desktop (lg+). */
export const DesktopIcons = ({ apps }: { apps: AppType[] }) => {
  const { pathname } = useLocation();
  return (
    <nav className="sticky top-16 hidden w-24 shrink-0 flex-col items-center gap-5 self-start lg:flex">
      {apps.map((app) => {
        const active = pathname === app.to;
        return (
          <Link
            key={app.to}
            to={app.to}
            className="group flex flex-col items-center gap-2"
          >
            <span
              className={cn(
                "rounded-[20px] p-0.5 transition-all",
                active ? "bg-white/60 ring-1 ring-mariner-300" : "group-hover:-translate-y-0.5"
              )}
            >
              <AppTile app={app} />
            </span>
            <span
              className={cn(
                "rounded-md px-1.5 text-xs",
                active
                  ? "font-semibold text-mariner-950"
                  : "text-mariner-950/70"
              )}
            >
              {app.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

/** Bottom dock used as primary navigation below lg. */
export const Dock = ({ apps }: { apps: AppType[] }) => {
  const { pathname } = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto flex max-w-md items-end justify-between rounded-[22px] border border-white/70 bg-white/70 px-2 py-2 shadow-widget backdrop-blur-2xl">
        {apps.slice(0, 5).map((app) => {
          const active = pathname === app.to;
          return (
            <Link
              key={app.to}
              to={app.to}
              className="flex flex-1 flex-col items-center gap-1"
              aria-current={active ? "page" : undefined}
            >
              <AppTile app={app} size="sm" />
              <span
                className={cn(
                  "text-[10px] leading-none",
                  active ? "font-semibold text-foreground" : "text-muted-foreground"
                )}
              >
                {app.label}
              </span>
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  active ? "bg-foreground/70" : "bg-transparent"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
