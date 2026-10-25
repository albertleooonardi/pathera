import MainLayout from "./layout/MainLayout";
import { useParams } from "react-router-dom";
import { Skeleton } from "./components/ui/skeleton";
import useSmoothScroll from "./hooks/useSmoothScroll";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion";
import { ChevronDown, RotateCcw } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "./config/settings";
import {
  AnswerDetailsType,
  PracticeSessionType,
} from "./types/PracticeSessionTypes";
import { useToaster } from "./context/ToastContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button";
import { formatPostDate, getScoreColor } from "./lib/utils";
import PageHeader from "./components/PageHeader";
import ScoreRing from "./components/ScoreRing";

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<PracticeSessionType | null>(null);
  const [answers, setAnswers] = useState<AnswerDetailsType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { toastError } = useToaster();

  useEffect(() => {
    // Ignore a stale response, so a double-run effect (StrictMode) or a quick id change can't toast twice
    let ignore = false;
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-session/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!ignore && response.status === 200) {
          setSession({
            id: response.data.id,
            user_id: response.data.userId,
            job_title: response.data.jobTitle,
            average_score: response.data.averageScore,
            createdAt: response.data.createdAt,
          });
          setAnswers(response.data.answers);
        }
      } catch (error: unknown) {
        if (ignore) return;
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status === 404) {
          toastError("We couldn't find that practice session.");
        } else if (status === 403) {
          navigate("/history");
          toastError("That practice session belongs to another account.");
        } else {
          toastError("An error occurred. Please try again later");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  useSmoothScroll();

  return (
    <MainLayout title="Results" size="narrow">
      <div className="container-page">
        <PageHeader
          eyebrow="Interview results"
          title={session ? session.job_title : "Results"}
          description="Expand any question to compare your answer with the sample answer."
          actions={
            <Button variant="outline" size="sm" onClick={() => navigate("/interview")}>
              <RotateCcw />
              Practice again
            </Button>
          }
        />

        {!loading && !session ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <p className="font-display text-2xl">Results unavailable</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This session couldn't be loaded. It may have been removed.
            </p>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => navigate("/history")}>
                View history
              </Button>
              <Button onClick={() => navigate("/interview")}>Start practicing</Button>
            </div>
          </div>
        ) : loading ? (
          <div className="surface flex flex-col gap-4 p-6">
            <Skeleton className="h-16 w-1/2" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        ) : (
          <div className="flex animate-fade-up flex-col gap-4">
            {session && (
              <div className="surface relative flex items-center gap-5 overflow-hidden p-5 sm:gap-6 sm:p-8">
                <div className="pointer-events-none absolute -left-10 -top-16 h-48 w-48 rounded-full bg-sky-100 blur-3xl" />
                <ScoreRing
                  value={Number(session.average_score)}
                  size={88}
                  stroke={6}
                  className="relative"
                />
                <div className="relative min-w-0">
                  <p className="eyebrow">Average score</p>
                  <p className="mt-1 font-display text-4xl sm:text-5xl">
                    {Number(session.average_score).toFixed(0)}
                    <span className="text-lg text-muted-foreground">/100</span>
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {answers?.length ?? 0} questions · {formatPostDate(session.createdAt)}
                  </p>
                </div>
              </div>
            )}

            <Accordion type="single" collapsible className="surface overflow-hidden">
              {answers &&
                answers.map((answer, index) => (
                  <AccordionItem
                    value={`item-${index}`}
                    className="border-border last:border-b-0"
                    key={index}
                  >
                    <AccordionTrigger className="gap-4 px-5 py-5 text-left hover:bg-muted sm:px-6">
                      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                        <span className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="text-sm font-normal leading-relaxed sm:text-[15px]">
                          {answer.question}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`font-mono text-sm font-medium ${getScoreColor(
                            answer.score
                          )}`}
                        >
                          {`${answer.score}%`}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="grid gap-3 px-5 pb-6 sm:grid-cols-2 sm:px-6">
                      <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-4">
                        <p className="eyebrow mb-2 text-primary/80">Your answer</p>
                        <p className="leading-relaxed">{answer.answer}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/60 p-4">
                        <p className="eyebrow mb-2">Sample answer</p>
                        <p className="leading-relaxed text-muted-foreground">
                          {answer.sampleAnswer}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Results;
