import MainLayout from "./layout/MainLayout";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "./config/settings";
import { JobType } from "./types/JobTypes";
import JobCard from "./components/JobCard";
import JobSkeleton from "./components/JobSkeleton";
import PageHeader from "./components/PageHeader";
import EmptyState from "./components/EmptyState";
import { Button } from "./components/ui/button";
import { Heart, RotateCcw, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SavedJobs = () => {
  const [jobs, setJobs] = useState<JobType[] | null>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [failed, setFailed] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setFailed(false);
      const response = await axios.get(`${BASE_URL}/saved-jobs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const jobs: JobType[] = response.data.map(
        (job: { job: JobType }) => job.job
      );
      setJobs(jobs);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <MainLayout title="Saved jobs">
      <div className="container-page">
        <PageHeader
          eyebrow="Saved"
          title="Jobs you saved for later"
          description="Whether you're exploring new opportunities or keeping track of interesting roles, you'll find them all here."
          actions={
            !loading &&
            !!jobs?.length && (
              <span className="font-mono text-xs text-muted-foreground">
                {jobs.length} saved
              </span>
            )
          }
        />
        {failed ? (
          <EmptyState
            tone="error"
            icon={WifiOff}
            title="Couldn't load saved jobs"
            description="Check your connection and try again."
            action={
              <Button variant="outline" onClick={fetchData}>
                <RotateCcw />
                Try again
              </Button>
            }
          />
        ) : !loading && jobs?.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No saved jobs yet"
            description="Tap the heart on any job's detail page to save it here."
            action={<Button onClick={() => navigate("/jobs")}>Browse jobs</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <JobSkeleton key={index} />
                ))
              : jobs?.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SavedJobs;
