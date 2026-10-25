import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, LogOut, History } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/config/settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogoMark } from "./Logo";
import { cn } from "@/lib/utils";

const Clock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const date = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <span className="hidden tabular-nums sm:inline">
      {date} {time}
    </span>
  );
};

type HeaderProps = {
  appName: string;
  hasRecommendations: boolean;
};

const Header: React.FC<HeaderProps> = ({ appName, hasRecommendations }) => {
  const [user, fetchUser] = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${BASE_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      // Always end the local session, even if the server call fails.
      localStorage.removeItem("token");
      sessionStorage.removeItem("questions");
      localStorage.removeItem("selectedJobTitle");
      localStorage.removeItem("recommendations");
      localStorage.removeItem("skill_matches");
      await fetchUser();
      navigate("/");
    }
  };

  const menuLinks = [
    { to: "/", label: "Home" },
    { to: "/jobs", label: "Jobs" },
    hasRecommendations
      ? { to: "/recommendations", label: "For You" }
      : { to: "/assessment", label: "Assessment" },
    { to: "/interview", label: "Interview" },
  ];

  const initial = user?.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/60 bg-white/55 backdrop-blur-2xl">
      <div className="flex h-11 items-center gap-1 px-3 text-[13px] sm:px-4">
        <Link to="/" aria-label="PathEra home" className="mr-2 shrink-0">
          <LogoMark className="h-6 w-6 rounded-full" />
        </Link>
        <span className="mr-2 truncate font-semibold">{appName}</span>

        <nav className="hidden items-center md:flex">
          {menuLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-md px-2.5 py-1 transition-colors hover:bg-foreground/[0.06]",
                location.pathname === link.to
                  ? "text-foreground"
                  : "text-foreground/70"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 text-foreground/80 sm:gap-4">
          <span className="hidden items-center gap-1.5 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            AI ready
          </span>
          <Clock />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex h-7 items-center rounded-full outline-none ring-primary/50 focus-visible:ring-2"
                aria-label="Account menu"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mariner-100 text-xs font-semibold text-mariner-800 ring-1 ring-mariner-200">
                  {initial}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/saved-jobs">
                    <BriefcaseBusiness className="h-4 w-4" />
                    Saved jobs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/history">
                    <History className="h-4 w-4" />
                    Practice history
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="rounded-md bg-foreground/[0.06] px-2.5 py-1 font-medium text-foreground hover:bg-foreground/10"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
