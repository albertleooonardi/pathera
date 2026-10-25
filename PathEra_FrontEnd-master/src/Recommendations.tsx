import MainLayout from "./layout/MainLayout";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { JobType, RecommendationType } from "./types/JobTypes";
import { Progress } from "./components/ui/progress";
import useSmoothScroll from "./hooks/useSmoothScroll";
import { BASE_URL } from "./config/settings";
import { Check, RotateCcw, Sparkles, WifiOff, X } from "lucide-react";
import EmptyState from "./components/EmptyState";
import PageHeader from "./components/PageHeader";
import JobSkeleton from "./components/JobSkeleton";
import { CompanyLogo, JobTags } from "./components/JobCard";
import { Button } from "./components/ui/button";

const Recommendations = () => {
  useSmoothScroll();
  const [jobs, setJobs] = useState<RecommendationType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [failed, setFailed] = useState(false);
  const [revealedJobs, setRevealedJobs] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem("recommendations");
    if (storedData) {
      try {
        const recommendations: RecommendationType[] = JSON.parse(storedData);
        const extractedJobIds = recommendations.map((item) => item.id);
        fetchJobs(extractedJobIds, recommendations);
      } catch (error) {
        console.error(
          "Error parsing recommendations from local storage:",
          error
        );
        localStorage.removeItem("recommendations");
        navigate("/assessment", { replace: true });
      }
    } else {
      navigate("/assessment", { replace: true });
    }
  }, []);

  const fetchJobs = async (
    jobIds: number[],
    recommendations: RecommendationType[]
  ) => {
    setLoading(true);
    setFailed(false);
    try {
      if (jobIds.length > 0) {
        const response = await axios.get(`${BASE_URL}/get-recommendations`, {
          params: {
            ids: jobIds.join(","),
          },
        });

        const combinedData = response.data.map((job: JobType) => {
          const recommendation = recommendations.find(
            (rec) => rec.id === job.id
          );
          return {
            ...job,
            ...recommendation,
          };
        });

        const sortedData = combinedData.sort(
          (a: RecommendationType, b: RecommendationType) =>
            b.similarity - a.similarity
        );

        setJobs(sortedData);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error(error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    const storedData = localStorage.getItem("recommendations");
    if (!storedData) return;
    const recommendations: RecommendationType[] = JSON.parse(storedData);
    fetchJobs(
      recommendations.map((item) => item.id),
      recommendations
    );
  };

  useEffect(() => {
    if (!loading) {
      jobs.forEach((_, index) => {
        setTimeout(() => {
          setRevealedJobs((prevRevealed) => [...prevRevealed, index]);
        }, index * 80);
      });
    }
  }, [loading, jobs]);

  return (
    <MainLayout title="For You">
      <div className="container-page">
        <PageHeader
          eyebrow="For you"
          title={
            <>
              Recommended <span className="text-gradient">opportunities</span>
            </>
          }
          description="Based on your profile and preferences, we have curated a list of job recommendations tailored just for you."
          actions={
            <Button variant="outline" size="sm" onClick={() => navigate("/assessment")}>
              <RotateCcw />
              Retake assessment
            </Button>
          }
        />
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <JobSkeleton key={index} />
            ))}
          </div>
        ) : failed ? (
          <EmptyState
            tone="error"
            icon={WifiOff}
            title="Couldn't load your matches"
            description="Check your connection and try again."
            action={
              <Button variant="outline" onClick={retry}>
                <RotateCcw />
                Try again
              </Button>
            }
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No matches yet"
            description="Add more job titles or skills to your assessment to widen the search."
            action={
              <Button onClick={() => navigate("/assessment")}>Retake assessment</Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, index) => (
              <Link
                to={`/jobdetail/${job.id}`}
                key={job.id}
                className={`surface surface-interactive group flex flex-col gap-5 p-5 transition-all duration-500 ease-out ${
                  revealedJobs.includes(index)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <CompanyLogo
                    src={job.companyId.company_image}
                    name={job.companyId.company_name}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 font-sans text-[15px] font-medium leading-snug transition-colors group-hover:text-primary">
                      {job.job_title}
                    </h3>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {job.companyId.company_name}
                      {job.location && ` · ${job.location.split(",")[0]}`}
                    </p>
                  </div>
                  {index < 3 && (
                    <span className="chip border-primary/30 bg-primary/[0.08] font-mono text-primary">
                      #{index + 1}
                    </span>
                  )}
                </div>

                <JobTags tags={[job.job_model, job.job_type, job.job_level]} />

                <div className="mt-auto border-t border-border/70 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Similarity</span>
                    <span className="font-mono text-lg font-medium text-primary">
                      {job.similarity.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={job.similarity} className="mt-2" />

                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    {job.title_score !== 0 && (
                      <MatchRow label="Title match" value={`${job.title_score.toFixed(0)}%`} />
                    )}
                    {job.skill_score !== 0 && (
                      <MatchRow label="Skill match" value={`${job.skill_score.toFixed(0)}%`} />
                    )}
                    {job.degree_score !== -1 && (
                      <MatchRow label="Degree" score={job.degree_score} />
                    )}
                    {job.experience_score !== -1 && (
                      <MatchRow label="Experience" score={job.experience_score} />
                    )}
                  </dl>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

const MatchRow = ({
  label,
  value,
  score,
}: {
  label: string;
  value?: string;
  score?: number;
}) => {
  const isBinary = score !== undefined && (score === 100 || score === 0);
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="flex items-center gap-1.5 text-muted-foreground">
        {isBinary &&
          (score === 100 ? (
            <Check className="h-3 w-3 text-success" strokeWidth={3} />
          ) : (
            <X className="h-3 w-3 text-destructive" strokeWidth={3} />
          ))}
        {label}
      </dt>
      <dd
        className={`font-mono ${
          score === 100 ? "text-success" : score === 0 ? "text-destructive" : ""
        }`}
      >
        {value ??
          (score === 100 ? "Met" : score === 0 ? "Not met" : score?.toFixed(0))}
      </dd>
    </div>
  );
};

export default Recommendations;
