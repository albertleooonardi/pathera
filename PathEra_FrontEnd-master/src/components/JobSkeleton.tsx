import { Skeleton } from "./ui/skeleton";

const JobSkeleton = () => {
  return (
    <div className="surface flex w-full flex-col gap-5 p-5">
      <div className="flex items-start gap-3.5">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex items-center justify-between border-t border-border/70 pt-4">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-16" />
      </div>
    </div>
  );
};

export default JobSkeleton;
