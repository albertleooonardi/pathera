import React from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { cn } from "@/lib/utils";

interface JobFilterProps {
  filters: {
    jobModel: string[];
    jobType: string[];
    jobLevel: string[];
  };
  onFilterChange: (
    filterCategory: keyof JobFilterProps["filters"],
    filterValue: string
  ) => void;
  onClearAll: () => void;
}

type FilterKey = keyof JobFilterProps["filters"];

const FILTER_GROUPS: {
  key: FilterKey;
  label: string;
  options: { label: string; value: string }[];
}[] = [
  {
    key: "jobModel",
    label: "Work model",
    options: [
      { label: "Hybrid", value: "Hybrid" },
      { label: "On-site", value: "On-site" },
      { label: "Remote", value: "Remote" },
    ],
  },
  {
    key: "jobType",
    label: "Job type",
    options: [
      { label: "Part-time", value: "Part-time" },
      { label: "Full-time", value: "Full-time" },
      { label: "Contract", value: "Contract" },
      { label: "Internship", value: "Internship" },
    ],
  },
  {
    key: "jobLevel",
    label: "Job level",
    options: [
      { label: "Entry level", value: "Entry level" },
      { label: "Intern", value: "Intern" },
      { label: "Associate", value: "Associate" },
      { label: "Director", value: "Director" },
      { label: "Mid-Senior level", value: "Mid-Senior level" },
    ],
  },
];

const JobFilter: React.FC<JobFilterProps> = ({
  filters,
  onFilterChange,
  onClearAll,
}) => {
  const totalSelected =
    filters.jobModel.length + filters.jobType.length + filters.jobLevel.length;

  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
      {FILTER_GROUPS.map((group) => {
        const count = filters[group.key].length;
        return (
          <Popover key={group.key}>
            <PopoverTrigger
              className={cn(
                "group flex h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm transition-colors data-[state=open]:border-primary/50",
                count > 0
                  ? "border-primary/40 bg-primary/10 text-mariner-800"
                  : "border-input bg-white text-muted-foreground hover:text-foreground"
              )}
            >
              {group.label}
              {count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-mono text-[11px] font-medium text-primary-foreground">
                  {count}
                </span>
              )}
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-60 p-1.5">
              <p className="eyebrow px-2.5 pb-1.5 pt-2">{group.label}</p>
              {group.options.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Checkbox
                    checked={filters[group.key].includes(option.value)}
                    onCheckedChange={() =>
                      onFilterChange(group.key, option.value)
                    }
                  />
                  {option.label}
                </label>
              ))}
            </PopoverContent>
          </Popover>
        );
      })}
      {totalSelected > 0 && (
        <button
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          onClick={onClearAll}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      )}
    </div>
  );
};

export default JobFilter;
