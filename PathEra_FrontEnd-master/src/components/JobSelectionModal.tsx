import React from "react";
import { ArrowRight, BarChart3, Code2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface JobSelectionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelectJob: (title: string) => void;
  canCancel?: boolean;
}

const JobSelectionModal: React.FC<JobSelectionModalProps> = ({
  open,
  setOpen,
  onSelectJob,
  canCancel = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-xl p-5 sm:p-8">
        <AlertDialogCancel
          aria-label="Close"
          className="absolute right-4 top-4 mt-0 h-8 w-8 rounded-lg border-0 p-0 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </AlertDialogCancel>
        <AlertDialogHeader>
          <p className="eyebrow">Interview simulation</p>
          <AlertDialogTitle className="text-2xl">
            Select your job title
          </AlertDialogTitle>
          <AlertDialogDescription>
            We'll tailor the interview questions to this role.
            {canCancel && " Switching roles starts a new session."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => onSelectJob("Data Science")}
            className="surface surface-interactive group flex flex-col gap-8 p-5 text-left"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-white to-sky-50 text-sky-700 ring-1 ring-black/[0.07] shadow-tile">
              <BarChart3 size={20} strokeWidth={1.5} />
            </span>
            <span className="flex items-center justify-between">
              <span className="font-display text-lg font-medium">
                Data Science
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </span>
          </button>
          <div className="surface flex cursor-not-allowed flex-col gap-8 p-5 opacity-50">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/60 text-muted-foreground">
              <Code2 size={20} strokeWidth={1.5} />
            </span>
            <span className="flex items-center justify-between gap-2">
              <span className="font-display text-lg font-medium">
                Software Engineer
              </span>
              <span className="chip">Soon</span>
            </span>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default JobSelectionModal;
