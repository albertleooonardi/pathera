import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "./layout/MainLayout";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import EmptyState from "./components/EmptyState";
import { useToaster } from "./context/ToastContext";
import {
  ArrowLeft,
  SearchX,
  Check,
  ExternalLink,
  GraduationCap,
  BriefcaseBusiness,
  Building2,
  Heart,
  History,
  Factory,
  MapPin,
  X,
} from "lucide-react";
import useSmoothScroll from "./hooks/useSmoothScroll";
import { cn, formatPostDate } from "./lib/utils";
import { Button } from "./components/ui/button";
import { JobDetailType } from "./types/JobTypes";
import { useUser } from "./context/UserContext";
import { BASE_URL } from "./config/settings";
import { RawSkillMatches, SkillMatchesType } from "./types/SkillType";
import LoadingIcon from "./components/LoadingIcon";
import { CompanyLogo, JobTags } from "./components/JobCard";

const JobDetail: React.FC = () => {
  const { id } = useParams();
  const [user] = useUser();
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [jobDetails, setJobDetails] = useState<JobDetailType | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toastError } = useToaster();
  const [skillMatches, setSkillMatches] = useState<SkillMatchesType[] | null>(
    null
  );

  useSmoothScroll();

  const fetchJobDetails = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/jobs/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setIsWishlisted(response.data.isSaved);
      setJobDetails(response.data);
      const storedSkills = localStorage.getItem("skill_matches");

      if (storedSkills) {
        const skills = JSON.parse(storedSkills);

        const matchedSkills = skills.find(
          (skill: RawSkillMatches) => skill.id === parseInt(id)
        );

        if (matchedSkills && matchedSkills.skill_matches) {
          console.log(
            "Matched Skills:",
            JSON.parse(matchedSkills.skill_matches)
          );
          setSkillMatches(JSON.parse(matchedSkills.skill_matches));
        } else {
          setSkillMatches(null);
          console.log("No skills matched for this job id.");
        }
      }
    } catch (error) {
      console.error("Failed to fetch job details:", error);
      setJobDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const handleWishlistClick = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    try {
      setLoadingSave(true);
      if (!isWishlisted) {
        const response = await axios.post(
          `${BASE_URL}/save-job`,
          { job_id: id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.status === 201) {
          setIsWishlisted(true);
        }
      } else {
        const response = await axios.delete(`${BASE_URL}/remove-job`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          data: { job_id: id },
        });
        if (response.status === 200) {
          setIsWishlisted(false);
        }
      }
    } catch (error: unknown) {
      console.log(error);
      toastError(
        isWishlisted
          ? "Couldn't remove this job. Please try again."
          : "Couldn't save this job. Please try again."
      );
    } finally {
      setLoadingSave(false);
    }
  };

  const isSkillMatched = (skill: string) => {
    if (!skillMatches) {
      return false;
    }
    return skillMatches.some(
      (match) => match.matched_skill === skill.toLowerCase()
    );
  };

  if (loading) {
    return (
      <MainLayout title="Job details">
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingIcon />
        </div>
      </MainLayout>
    );
  }

  if (!id || !jobDetails) {
    return (
      <MainLayout title="Job details">
        <div className="container-page pt-10">
          <EmptyState
            icon={SearchX}
            title="Job not found"
            description="This role may have been filled or removed, or the connection failed."
            action={
              <>
                <Button variant="outline" onClick={fetchJobDetails}>
                  Try again
                </Button>
                <Button onClick={() => navigate("/jobs")}>Browse jobs</Button>
              </>
            }
          />
        </div>
      </MainLayout>
    );
  }

  const matchedCount = skillMatches
    ? jobDetails.skillsRequired.filter((skill) => isSkillMatched(skill)).length
    : 0;

  const infoRows = [
    { icon: Building2, label: "Company", value: jobDetails.companyName },
    { icon: MapPin, label: "Location", value: jobDetails.location },
    { icon: Factory, label: "Industry", value: jobDetails.industry },
    { icon: GraduationCap, label: "Degree", value: jobDetails.degree },
    {
      icon: BriefcaseBusiness,
      label: "Min experience",
      value:
        jobDetails.minExperience == -1
          ? "None"
          : `${jobDetails.minExperience} Years`,
    },
    {
      icon: History,
      label: "Date posted",
      value: jobDetails.datePosted ? formatPostDate(jobDetails.datePosted) : null,
    },
  ].filter((row) => row.value);

  return (
    <MainLayout title="Job details">
      <div className="container-page pt-6 sm:pt-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="surface relative animate-fade-up overflow-hidden p-5 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-sky-100 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <CompanyLogo
                src={jobDetails.companyImage}
                name={jobDetails.companyName}
                className="h-14 w-14 rounded-2xl"
              />
              <div className="min-w-0">
                <h1 className="text-3xl leading-tight sm:text-5xl">
                  {jobDetails.jobTitle}
                </h1>
                <p className="mt-1.5 text-[15px] text-muted-foreground">
                  <span className="text-foreground">{jobDetails.companyName}</span>
                  {jobDetails.location && ` · ${jobDetails.location}`}
                </p>
                <JobTags
                  className="mt-4"
                  tags={[
                    jobDetails.jobModel,
                    jobDetails.jobType,
                    jobDetails.jobLevel,
                  ]}
                />
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button asChild size="lg" className="flex-1 md:flex-none">
                <a
                  href={`https://www.linkedin.com/jobs/view/${id}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Apply now
                  <ExternalLink />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={loadingSave}
                onClick={handleWishlistClick}
                aria-label={isWishlisted ? "Remove from saved" : "Save job"}
                className={cn(
                  "w-12 px-0",
                  isWishlisted &&
                    "border-destructive/40 bg-destructive/10 text-destructive hover:border-destructive/60 hover:bg-destructive/15"
                )}
              >
                <Heart className={cn(isWishlisted && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="flex min-w-0 flex-col gap-4">
            <section className="surface p-5 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-medium">Skills required</h2>
                {skillMatches && (
                  <span className="font-mono text-xs text-muted-foreground">
                    <span className="text-success">{matchedCount}</span> /{" "}
                    {jobDetails.skillsRequired.length} matched
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {jobDetails.skillsRequired.map((skill: string, index: number) => {
                  const isMatched = isSkillMatched(skill);
                  const Icon = isMatched ? Check : skillMatches ? X : null;

                  return (
                    <span
                      key={index}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
                        !skillMatches && "border-border bg-muted/60",
                        skillMatches &&
                          isMatched &&
                          "border-success/30 bg-success/10 text-success",
                        skillMatches &&
                          !isMatched &&
                          "border-border bg-muted/60 text-muted-foreground"
                      )}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />}
                      {skill}
                    </span>
                  );
                })}
              </div>
              {!skillMatches && (
                <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
                  Want to see which of these skills you already have?{" "}
                  <Link to="/assessment" className="font-medium text-primary hover:underline">
                    Take the assessment
                  </Link>
                </p>
              )}
            </section>

            <section className="surface p-5 sm:p-8">
              <h2 className="text-lg font-medium">About this role</h2>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
                {jobDetails.jobDescription}
              </p>
            </section>
          </div>

          <aside className="lg:sticky lg:top-16 lg:self-start">
            <div className="surface p-5 sm:p-6">
              <p className="eyebrow">Job information</p>
              <dl className="mt-5 flex flex-col gap-5">
                {infoRows.map((row) => (
                  <div key={row.label} className="flex items-start gap-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-muted-foreground">
                      <row.icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">{row.label}</dt>
                      <dd className="mt-0.5 break-words text-sm">{row.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetail;
