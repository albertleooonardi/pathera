import { PropsWithChildren, ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import Window from "@/components/Window";
import { LogoMark } from "@/components/Logo";

type AuthLayoutProps = PropsWithChildren & {
  title: string;
  description: string;
  footer?: ReactNode;
};

const HIGHLIGHTS = [
  "Jobs ranked by how well they match your skills",
  "AI interviewer with instant, scored feedback",
  "Track your progress across every practice session",
];

const AuthLayout = ({ title, description, footer, children }: AuthLayoutProps) => {
  useEffect(() => {
    document.title = `${title} · PathEra`;
  }, [title]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-11 items-center gap-2 border-b border-white/60 bg-white/55 px-3 text-[13px] backdrop-blur-2xl sm:px-4">
        <LogoMark className="h-6 w-6 rounded-full" />
        <span className="font-semibold">PathEra</span>
        <Link
          to="/"
          className="ml-auto flex items-center gap-1.5 rounded-md px-2.5 py-1 text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-3 py-8 sm:px-6 sm:py-12">
        <Window title={title} className="w-full max-w-4xl">
          <div className="grid md:grid-cols-[1fr_1.1fr]">
            <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-gradient-to-br from-violet-100 via-mariner-50 to-sky-100 p-10 md:flex">
              <div className="bg-grid pointer-events-none absolute inset-0" />
              <div className="relative">
                <p className="eyebrow">Your career, accelerated</p>
                <div className="mt-6 flex items-center gap-3">
                  <LogoMark className="h-12 w-12 rounded-full" />
                  <span className="font-display text-4xl">PathEra</span>
                </div>
                <h2 className="mt-6 text-3xl leading-tight">
                  The smarter path to your next role.
                </h2>
              </div>
              <ul className="relative mt-10 flex flex-col gap-3.5">
                {HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground/75">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </aside>

            <div className="flex flex-col justify-center p-6 sm:p-10">
              <div className="animate-fade-up">
                <p className="eyebrow mb-4">Account</p>
                <h1 className="text-4xl sm:text-5xl">{title}</h1>
                <p className="mt-3 text-[15px] text-muted-foreground">{description}</p>
              </div>
              <div className="mt-8 animate-fade-up" style={{ animationDelay: "80ms" }}>
                {children}
              </div>
              {footer && (
                <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
                  {footer}
                </div>
              )}
            </div>
          </div>
        </Window>
      </div>
    </div>
  );
};

export default AuthLayout;
