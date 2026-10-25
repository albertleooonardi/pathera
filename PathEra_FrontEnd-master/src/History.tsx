import MainLayout from "./layout/MainLayout";
import { BASE_URL } from "./config/settings";
import { useEffect, useState } from "react";
import axios from "axios";
import { PracticeSessionType } from "./types/PracticeSessionTypes";
import { formatPostDate } from "./lib/utils";
import { ArrowUpRight, Mic, RotateCcw, WifiOff } from "lucide-react";
import EmptyState from "./components/EmptyState";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "./components/PageHeader";
import ScoreRing from "./components/ScoreRing";
import { Skeleton } from "./components/ui/skeleton";
import { Button } from "./components/ui/button";

const History = () => {
  const [sessions, setSessions] = useState<PracticeSessionType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const navigate = useNavigate();
  const fetchData = async () => {
      setLoading(true);
      setFailed(false);
      try {
        const response = await axios.get(`${BASE_URL}/history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.status === 200) {
          setSessions(response.data);
        }
      } catch (error) {
        console.log(error);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <MainLayout title="History" size="narrow">
      <div className="container-page">
        <PageHeader
          eyebrow="Your progress"
          title="Practice history"
          description="Every interview session you've completed, with its average score."
        />

        {failed ? (
          <EmptyState
            tone="error"
            icon={WifiOff}
            title="Couldn't load your history"
            description="Check your connection and try again."
            action={
              <Button variant="outline" onClick={fetchData}>
                <RotateCcw />
                Try again
              </Button>
            }
          />
        ) : loading ? (
          <div className="surface divide-y divide-border">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-5">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="surface animate-fade-up divide-y divide-border overflow-hidden">
            {sessions.map((session) => (
              <Link
                key={session.id}
                to={`/results/${session.id}`}
                className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted sm:p-5"
              >
                <ScoreRing value={Number(session.average_score)} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium transition-colors group-hover:text-primary">
                    {session.job_title}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {formatPostDate(session.createdAt)}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Mic}
            title="No practice sessions yet"
            description="Complete an interview simulation to see it here."
            action={<Button onClick={() => navigate("/interview")}>Start practicing</Button>}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default History;
