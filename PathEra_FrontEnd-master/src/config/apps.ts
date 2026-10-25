import {
  BriefcaseBusiness,
  Heart,
  History,
  House,
  LucideIcon,
  Mic,
  ScanSearch,
  Sparkles,
} from "lucide-react";

export type AppType = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Pale tile fill + single icon tone (kept subtle, like system app icons). */
  tile: string;
};

export const HOME_APP: AppType = {
  to: "/",
  label: "Home",
  icon: House,
  tile: "from-white to-slate-50 text-mariner-900",
};

export const JOBS_APP: AppType = {
  to: "/jobs",
  label: "Jobs",
  icon: BriefcaseBusiness,
  tile: "from-white to-sky-50 text-sky-700",
};

export const ASSESSMENT_APP: AppType = {
  to: "/assessment",
  label: "Assessment",
  icon: ScanSearch,
  tile: "from-white to-violet-50 text-violet-700",
};

export const RECOMMENDATIONS_APP: AppType = {
  to: "/recommendations",
  label: "For You",
  icon: Sparkles,
  tile: "from-white to-violet-50 text-mariner-700",
};

export const INTERVIEW_APP: AppType = {
  to: "/interview",
  label: "Interview",
  icon: Mic,
  tile: "from-white to-mariner-50 text-mariner-700",
};

export const HISTORY_APP: AppType = {
  to: "/history",
  label: "History",
  icon: History,
  tile: "from-white to-slate-100 text-slate-700",
};

export const SAVED_APP: AppType = {
  to: "/saved-jobs",
  label: "Saved",
  icon: Heart,
  tile: "from-white to-rose-50 text-rose-600",
};

export const getApps = (hasRecommendations: boolean): AppType[] => [
  HOME_APP,
  JOBS_APP,
  hasRecommendations ? RECOMMENDATIONS_APP : ASSESSMENT_APP,
  INTERVIEW_APP,
  HISTORY_APP,
  SAVED_APP,
];

export const hasStoredRecommendations = () => {
  try {
    return !!localStorage.getItem("recommendations");
  } catch {
    return false;
  }
};
