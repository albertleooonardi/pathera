import React from "react";
import { SearchX } from "lucide-react";
import { JobType } from "@/types/JobTypes";
import JobCard from "./JobCard";
import JobSkeleton from "./JobSkeleton";
import EmptyState from "./EmptyState";
import { Button } from "./ui/button";

interface JobListProps {
  jobs: JobType[];
  loading: boolean;
  onClearAll?: () => void;
}

const JobList: React.FC<JobListProps> = ({ jobs, loading, onClearAll }) => {
  const skeletonCount = 6;

  return (
    <div className="pt-6">
      {!loading && (
        <p className="mb-4 font-mono text-xs text-muted-foreground">
          {jobs.length} {jobs.length === 1 ? "result" : "results"}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <JobSkeleton key={index} />
            ))
          : jobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
      {!loading && jobs.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No jobs match your search"
          description="Try a different keyword or clear some filters."
          action={
            onClearAll && (
              <Button variant="outline" onClick={onClearAll}>
                Clear search & filters
              </Button>
            )
          }
        />
      )}
    </div>
  );
};

export default JobList;
