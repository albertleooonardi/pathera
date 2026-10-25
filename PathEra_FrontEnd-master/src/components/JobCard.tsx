import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import { JobType } from "@/types/JobTypes";
import { cn, formatPostDate } from "@/lib/utils";

interface JobCardProps {
  job: JobType;
  className?: string;
}

export const CompanyLogo = ({
  src,
  name,
  className = "",
}: {
  src?: string;
  name: string;
  className?: string;
}) =>
  src ? (
    <img
      src={src}
      alt={name}
      className={cn(
        "h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-1.5",
        className
      )}
    />
  ) : (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 font-display text-sm font-semibold text-muted-foreground",
        className
      )}
    >
      {name?.charAt(0) || "?"}
    </div>
  );

export const JobTags = ({
  tags,
  className = "",
}: {
  tags: (string | undefined | null)[];
  className?: string;
}) => (
  <div className={cn("flex flex-wrap gap-1.5", className)}>
    {/* job_type and job_level can both be e.g. "Internship"; show it once (tags double as keys) */}
    {[...new Set(tags.filter(Boolean))].map((tag) => (
      <span key={tag} className="chip">
        {tag}
      </span>
    ))}
  </div>
);

const JobCard: React.FC<JobCardProps> = ({ job, className = "" }) => {
  return (
    <Link
      to={`/jobdetail/${job.id}`}
      className={cn(
        "surface surface-interactive group flex h-full w-full flex-col gap-5 p-5",
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <CompanyLogo
          src={job.companyId.company_image}
          name={job.companyId.company_name}
        />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-sans text-[15px] font-medium leading-snug text-foreground">
            {job.job_title}
          </h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {job.companyId.company_name}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <JobTags tags={[job.job_model, job.job_type, job.job_level]} />

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4 text-xs text-muted-foreground">
        {job.location ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.location.split(",")[0]}</span>
          </span>
        ) : (
          <span />
        )}
        {job.date_posted && (
          <span className="shrink-0 font-mono">
            {formatPostDate(job.date_posted)}
          </span>
        )}
      </div>
    </Link>
  );
};

export default JobCard;
