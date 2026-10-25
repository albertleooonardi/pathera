import { Button } from "./components/ui/button";
import StatisticsCard from "./components/StatisticsCard";
import MainLayout from "./layout/MainLayout";
import useSmoothScroll from "./hooks/useSmoothScroll";
import { Link, useNavigate } from "react-router-dom";
import { JobType } from "./types/JobTypes";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "./config/settings";
import JobCard, { CompanyLogo } from "./components/JobCard";
import JobSkeleton from "./components/JobSkeleton";
import Window from "./components/Window";
import { LogoMark } from "./components/Logo";
import { AppTile } from "./components/Dock";
import { Skeleton } from "./components/ui/skeleton";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import { ArrowRight, ArrowUpRight, Lightbulb, Mic } from "lucide-react";
import {
  ASSESSMENT_APP,
  HISTORY_APP,
  INTERVIEW_APP,
  JOBS_APP,
  RECOMMENDATIONS_APP,
  SAVED_APP,
} from "./config/apps";
import { formatPostDate } from "./lib/utils";

const WELCOME_STEPS = [
  {
    title: "Dock",
    description: "Open any application with one click.",
    to: "/jobs",
  },
  {
    title: "Assessment",
    description: "Map your skills to the roles that fit you.",
    to: "/assessment",
  },
  {
    title: "Interview",
    description: "Rehearse with an AI interviewer and get scored.",
    to: "/interview",
  },
];

const TIPS = [
  {
    title: "Find your fit",
    text: "Take the assessment to get roles ranked by similarity to your profile.",
    cta: "Open Assessment",
    to: "/assessment",
  },
  {
    title: "Practice out loud",
    text: "Interview answers are transcribed, so you can edit them before scoring.",
    cta: "Open Interview",
    to: "/interview",
  },
  {
    title: "Keep a shortlist",
    text: "Tap the heart on any job to save it for later in Saved.",
    cta: "Open Jobs",
    to: "/jobs",
  },
  {
    title: "Track progress",
    text: "Every interview session is stored with its average score in History.",
    cta: "Open History",
    to: "/history",
  },
];

const SHORTCUTS = [
  JOBS_APP,
  ASSESSMENT_APP,
  INTERVIEW_APP,
  RECOMMENDATIONS_APP,
  HISTORY_APP,
  SAVED_APP,
];

const timestamp = () =>
  new Date().toLocaleTimeString("en-GB", { hour12: false });

const Home = () => {
  useSmoothScroll();

  const [jobs, setJobs] = useState<JobType[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [revealedJobs, setRevealedJobs] = useState<number[]>([]);
  const [tipIndex, setTipIndex] = useState(0);
  const [log, setLog] = useState<string[]>(() => [
    `${timestamp()} session started`,
    `${timestamp()} opened Home`,
  ]);
  const navigate = useNavigate();

  // Skips a repeat of the previous event (effects run twice in StrictMode dev).
  const appendLog = (event: string) =>
    setLog((prev) =>
      prev[prev.length - 1]?.endsWith(event)
        ? prev
        : [...prev, `${timestamp()} ${event}`]
    );
  const sectionRef = useRef<HTMLDivElement>(null);

  const [text] = useTypewriter({
    words: ["find jobs for you.", "get you hired.", "help you ace your interview."],
    loop: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/featured`);
        setJobs(response.data);
        appendLog(`featured roles loaded (${response.data.length})`);
      } catch (error) {
        console.error("Error fetching data: ", error);
        appendLog("featured roles unavailable");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setTipIndex((prev) => (prev + 1) % TIPS.length),
      6000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading && jobs) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            // reveal once; re-entering the viewport shouldn't queue the cards again
            observer.disconnect();
            jobs.forEach((_, index) => {
              setTimeout(() => {
                setRevealedJobs((prevRevealed) => [...prevRevealed, index]);
              }, index * 80);
            });
          }
        },
        {
          threshold: 0.1,
        }
      );

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }

      return () => observer.disconnect();
    }
  }, [loading, jobs]);

  const tip = TIPS[tipIndex];
  const apiOnline = !loading && !!jobs;

  const widgets = (
    <>
      <div className="widget animate-window-in" style={{ animationDelay: "120ms" }}>
        <div className="mb-3 flex items-center justify-between">
          <p className="eyebrow">Featured on PathEra</p>
          <Link to="/jobs" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          {jobs?.slice(0, 3).map((job) => (
            <Link key={job.id} to={`/jobdetail/${job.id}`} className="group flex gap-3">
              <CompanyLogo
                src={job.companyId.company_image}
                name={job.companyId.company_name}
                className="h-10 w-10 rounded-lg border border-border"
              />
              <div className="min-w-0">
                <p className="line-clamp-2 text-[13px] leading-snug group-hover:text-primary">
                  {job.job_title}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {job.date_posted
                    ? formatPostDate(job.date_posted)
                    : job.companyId.company_name}
                </p>
              </div>
            </Link>
          ))}
          {!loading && !jobs && (
            <p className="text-[13px] text-muted-foreground">
              Featured roles are unavailable right now.
            </p>
          )}
        </div>
      </div>

      <div className="widget animate-window-in" style={{ animationDelay: "200ms" }}>
        <p className="eyebrow mb-3">PathEra tips</p>
        <div key={tipIndex} className="min-h-[104px] animate-fade-up">
          <p className="flex items-center gap-2 font-display text-lg">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-mariner-700 ring-1 ring-black/[0.07]">
              <Lightbulb className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
            {tip.title}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{tip.text}</p>
          <Link to={tip.to} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            {tip.cta} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {TIPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setTipIndex(index)}
              aria-label={`Show tip ${index + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                index === tipIndex ? "w-5 bg-foreground/70" : "w-1.5 bg-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="widget animate-window-in" style={{ animationDelay: "280ms" }}>
        <p className="eyebrow mb-3">Shortcuts</p>
        <div className="grid grid-cols-2 gap-2">
          {SHORTCUTS.map((app) => (
            <Link
              key={app.to}
              to={app.to}
              className="flex items-center gap-2 rounded-xl border border-border bg-white p-1.5 pr-2 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-mariner-50"
            >
              <span className="scale-75">
                <AppTile app={app} size="sm" />
              </span>
              <span className="-ml-1.5 truncate">{app.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="widget animate-window-in" style={{ animationDelay: "360ms" }}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">System status</p>
          <span
            className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] ${
              loading
                ? "bg-muted text-muted-foreground"
                : apiOnline
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {loading ? "Connecting" : apiOnline ? "Online" : "Offline"}
          </span>
        </div>
        <div className="mt-3 border-t border-border pt-3 font-mono text-[11px] leading-6 text-muted-foreground">
          {log.slice(-5).map((line, index) => (
            <p key={index} className="truncate">
              <span className="text-mariner-400">{line.slice(0, 8)}</span>
              {line.slice(8)}
            </p>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <MainLayout overflowHidden={true} title="Home" bare aside={widgets}>
      {/* Home window */}
      <Window title="Home">
        <div className="grid md:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col p-6 sm:p-10 lg:p-12">
            <p className="eyebrow">AI career platform</p>
            <div className="mt-6 flex items-center gap-4 sm:gap-5">
              <LogoMark className="h-14 w-14 shrink-0 rounded-full sm:h-16 sm:w-16" />
              <h1 className="text-5xl leading-none sm:text-6xl lg:text-7xl">PathEra</h1>
            </div>
            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-lg font-medium">
              <span>Job Matching</span>
              <span className="h-5 w-px bg-border" />
              <span className="text-primary">Interview Practice</span>
            </p>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              Work smarter and get hired. We {text}
              <Cursor cursorColor="hsl(var(--primary))" />
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="black" onClick={() => navigate("/jobs")}>
                Explore jobs
                <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/interview")}>
                <Mic />
                Practice interview
              </Button>
            </div>
          </div>

          <div className="flex flex-col border-t border-border bg-mariner-50/40 p-6 sm:p-10 md:border-l md:border-t-0 lg:p-12">
            <p className="eyebrow">Welcome</p>
            <h2 className="mt-4 text-4xl sm:text-[2.6rem]">Welcome to PathEra.</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              This workspace brings together job matching, skill assessment and
              interview practice as applications within one environment.
            </p>
            <ol className="mt-6 border-t border-border">
              {WELCOME_STEPS.map((step, index) => (
                <li key={step.title} className="border-b border-border">
                  <Link to={step.to} className="group flex items-start gap-5 py-4">
                    <span className="mt-0.5 font-mono text-xs text-muted-foreground">
                      0{index + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold group-hover:text-primary">
                        {step.title}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {step.description}
                      </span>
                    </span>
                    <ArrowUpRight className="mt-0.5 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-4">
          <StatisticsCard title="Live jobs" value="1,200+" />
          <StatisticsCard title="Daily job posts" value="100+" />
          <StatisticsCard title="People hired" value="2,000+" />
          <StatisticsCard title="Companies" value="50+" />
        </div>
      </Window>

      {/* Featured roles window */}
      <div ref={sectionRef}>
        <Window
          title="Featured roles"
          className="mt-6 lg:ml-10"
          style={{ animationDelay: "100ms" }}
        >
          <div className="p-6 sm:p-10">
            <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow mb-4">Featured roles</p>
                <h2 className="text-4xl sm:text-5xl">
                  Find jobs based on your skills
                </h2>
              </div>
              <Link to="/jobs" className="link-underline self-start sm:self-auto">
                View all jobs
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {loading &&
                !jobs &&
                Array.from({ length: 6 }).map((_, index) => (
                  <JobSkeleton key={index} />
                ))}
              {jobs &&
                jobs.map((job, index) => (
                  <JobCard
                    className={`transition-all duration-500 ease-out ${
                      revealedJobs.includes(index)
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-6"
                    }`}
                    key={job.id}
                    job={job}
                  />
                ))}
            </div>
            {!loading && (!jobs || jobs.length === 0) && (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
                <p className="font-medium">Featured roles are unavailable right now</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse the full list of open positions instead.
                </p>
                <Button variant="outline" className="mt-5" onClick={() => navigate("/jobs")}>
                  Browse jobs
                  <ArrowRight />
                </Button>
              </div>
            )}
          </div>
        </Window>
      </div>

      {/* Interview window */}
      <Window
        title="Interview simulation"
        className="mt-6 lg:mr-10"
        style={{ animationDelay: "200ms" }}
      >
        <div className="grid items-center gap-10 p-6 sm:p-10 md:grid-cols-[1.4fr_1fr] lg:p-12">
          <div>
            <p className="eyebrow mb-4">Interview simulation</p>
            <h2 className="text-4xl leading-tight sm:text-5xl">
              Rehearse with an AI interviewer before the real one.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              Getting ready for your next big interview? Speak your answers, get
              them transcribed, and receive an instant score with a model answer
              to compare against.
            </p>
            <Button
              size="lg"
              variant="black"
              className="mt-8 w-full sm:w-auto"
              onClick={() => navigate("/interview")}
            >
              Try it now
              <ArrowRight />
            </Button>
          </div>

          <div className="relative mx-auto flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56">
            <span className="absolute inset-0 rounded-full border border-mariner-100" />
            <span className="absolute inset-5 rounded-full border border-mariner-200" />
            <span className="absolute inset-10 animate-pulse rounded-full border border-mariner-300" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-mariner-700 shadow-tile ring-1 ring-black/[0.07]">
              <Mic size={28} strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </Window>
    </MainLayout>
  );
};

export default Home;
