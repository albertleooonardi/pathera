import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FormAlert = ({
  message,
  tone = "error",
}: {
  message: string;
  tone?: "error" | "success";
}) => {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm",
        tone === "error"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-success/30 bg-success/5 text-success"
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
};

export default FormAlert;
