import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Window from "@/components/Window";
import { Dock, DesktopIcons } from "@/components/Dock";
import { Toaster } from "@/components/ui/toaster";
import { getApps, hasStoredRecommendations } from "@/config/apps";
import { cn } from "@/lib/utils";

type MainLayoutProps = PropsWithChildren & {
  overflowHidden?: boolean;
  /** Window + menu bar title. */
  title?: string;
  /** "narrow" for focused, single-column apps. */
  size?: "wide" | "narrow";
  /** Render children directly on the desktop instead of inside one window. */
  bare?: boolean;
  /** Widget column shown on the right on xl screens. */
  aside?: ReactNode;
};

const MainLayout = ({
  children,
  overflowHidden = false,
  title = "PathEra",
  size = "wide",
  bare = false,
  aside,
}: MainLayoutProps) => {
  const [hasRecommendations] = useState(hasStoredRecommendations);
  const apps = getApps(hasRecommendations);

  useEffect(() => {
    document.title = title === "PathEra" ? "PathEra" : `${title} · PathEra`;
  }, [title]);

  return (
    <div className="min-h-screen">
      <Header appName={title} hasRecommendations={hasRecommendations} />

      <div className="mx-auto flex max-w-[1560px] gap-6 px-3 pb-32 pt-[60px] sm:px-5 lg:gap-8 lg:px-6 lg:pb-10 lg:pt-16">
        <DesktopIcons apps={apps} />

        <main
          className={cn(
            "min-w-0 flex-1",
            overflowHidden && "overflow-x-clip",
            size === "narrow" && "mx-auto max-w-4xl"
          )}
        >
          {bare ? children : <Window title={title}>{children}</Window>}
          <Footer />
        </main>

        {aside && (
          <aside className="sticky top-16 hidden w-72 shrink-0 flex-col gap-4 self-start 2xl:w-80 xl:flex">
            {aside}
          </aside>
        )}
      </div>

      <Dock apps={apps} />
      <Toaster />
    </div>
  );
};

export default MainLayout;
