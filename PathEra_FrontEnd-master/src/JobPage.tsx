import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Search, Sparkles, WifiOff, X } from "lucide-react";
import EmptyState from "./components/EmptyState";
import MainLayout from "./layout/MainLayout";
import JobFilter from "./components/JobFilter";
import JobList from "./components/JobList";
import PageHeader from "./components/PageHeader";
import { Button } from "./components/ui/button";
import axios from "axios";
import { BASE_URL } from "./config/settings";
import { JobType } from "./types/JobTypes";
import useDebounce from "./hooks/useDebounce";

type FilterType = {
  jobModel: string[];
  jobType: string[];
  jobLevel: string[];
};

const JobPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterType>({
    jobModel: [],
    jobType: [],
    jobLevel: [],
  });
  const [allJobs, setAllJobs] = useState<JobType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [loading, setLoading] = useState<boolean>(true);
  const [failed, setFailed] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await axios.get(`${BASE_URL}/jobs`);
      setAllJobs(response.data);
    } catch (error) {
      console.error(error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (
    filterCategory: keyof FilterType,
    filterValue: string
  ) => {
    setFilters((prevFilters) => {
      const updatedCategory = prevFilters[filterCategory].includes(filterValue)
        ? prevFilters[filterCategory].filter((value) => value !== filterValue)
        : [...prevFilters[filterCategory], filterValue];
      return { ...prevFilters, [filterCategory]: updatedCategory };
    });
  };

  const handleClearAll = () => {
    setFilters({
      jobModel: [],
      jobType: [],
      jobLevel: [],
    });
    setSearchQuery("");
  };

  const filteredJobs = useMemo(
    () =>
      allJobs.filter((job) => {
        const matchesSearchQuery = job.job_title
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase());

        const matchesFilters =
          (filters.jobModel.length === 0 ||
            filters.jobModel.includes(job.job_model)) &&
          (filters.jobType.length === 0 ||
            filters.jobType.includes(job.job_type)) &&
          (filters.jobLevel.length === 0 ||
            filters.jobLevel.includes(job.job_level));

        return matchesSearchQuery && matchesFilters;
      }),
    [allJobs, filters, debouncedSearch]
  );

  return (
    <MainLayout title="Jobs">
      <div className="container-page">
        <PageHeader
          eyebrow="Opportunities"
          title="Browse jobs"
          description="Search open roles and narrow them down by work model, type and seniority."
        />

        <div className="relative mb-6 flex rounded-2xl border border-mariner-100 bg-gradient-to-r from-mariner-50 to-violet-50 flex-col gap-4 overflow-hidden p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex items-start gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-700 ring-1 ring-black/[0.07] shadow-tile">
              <Sparkles size={18} strokeWidth={1.5} />
            </span>
            <div>
              <p className="font-medium">Want to know what job suits you?</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Take a quick assessment and get personalised matches.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="relative w-full sm:w-auto"
            onClick={() => navigate("/assessment")}
          >
            Check here
            <ArrowRight />
          </Button>
        </div>

        <div className="sticky top-14 z-30 rounded-2xl border border-border bg-white/90 p-2 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job title..."
                aria-label="Search job title"
                className="h-11 w-full rounded-xl border border-input bg-white pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <JobFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
            />
          </div>
        </div>

        {failed ? (
          <EmptyState
            className="mt-6"
            tone="error"
            icon={WifiOff}
            title="Couldn't load jobs"
            description="We couldn't reach the job service. Check your connection and try again."
            action={
              <Button variant="outline" onClick={fetchData}>
                <RotateCcw />
                Try again
              </Button>
            }
          />
        ) : (
          <JobList jobs={filteredJobs} loading={loading} onClearAll={handleClearAll} />
        )}
      </div>
    </MainLayout>
  );
};

export default JobPage;
