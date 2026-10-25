import { useState, useEffect } from "react";
import MainLayout from "./layout/MainLayout";
import JobSelectionModal from "./components/JobSelectionModal";
import { Progress } from "./components/ui/progress";
import { BASE_URL } from "./config/settings";
import { useUser } from "./context/UserContext";
import axios from "axios";
import { QuestionType } from "./types/QuestionType";
import { ArrowRight, Check, Mic, RefreshCw, Square } from "lucide-react";
import AiAvatar from "./components/AiAvatar";
import ScoreRing from "./components/ScoreRing";
import PageHeader from "./components/PageHeader";
import { getScoreColor } from "./lib/utils";
import { useMicrophone } from "./hooks/useMicrophone";
import { Button } from "./components/ui/button";
import useSmoothScroll from "./hooks/useSmoothScroll";
import { useToaster } from "./context/ToastContext";
import { FLASK_URL } from "./config/settings";
import QuestionDisplay from "./components/QuestionDisplay";
import SpeechEngine from "./components/SpeechEngine";
import LoadingButton from "./components/ui/loading-button";
import { useNavigate } from "react-router-dom";

const InterviewSimulation: React.FC = () => {
  const [user] = useUser();
  const [open, setOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questions, setQuestions] = useState<QuestionType[] | null>(null);
  const [questionsError, setQuestionsError] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isAudioVisible, setIsAudioVisible] = useState(false);
  const [loadingTranscription, setLoadingTranscription] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [scoreVisible, setScoreVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);

  const {
    isRecording,
    audio,
    remainingTime,
    startRecording,
    stopRecording,
    resetRecording,
  } = useMicrophone(60);
  const { toastError } = useToaster();

  useSmoothScroll();

  useEffect(() => {
    const savedJobTitle = localStorage.getItem("selectedJobTitle");
    const cachedQuestions = sessionStorage.getItem("questions");

    if (savedJobTitle) {
      setJobTitle(savedJobTitle);

      if (cachedQuestions) {
        setQuestions(JSON.parse(cachedQuestions));
        setLoadingQuestions(false);
      } else {
        fetchQuestions(savedJobTitle);
      }
    } else {
      setLoadingQuestions(false);
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (audio) {
      setIsAudioVisible(true);
      transcribeAudio(audio);
    }
  }, [audio]);

  const handleSelectJob = (title: string) => {
    if (title !== jobTitle || !questions) {
      // Start a clean session so answers from another role aren't submitted.
      setJobTitle(title);
      localStorage.setItem("selectedJobTitle", title);
      setAnswers([]);
      setScores([]);
      setFeedback([]);
      setTranscription(null);
      setCurrentScore(null);
      setIsAudioVisible(false);
      resetRecording();
      fetchQuestions(title);
    }
    setOpen(false);
  };

  const fetchQuestions = async (title: string) => {
    setLoadingQuestions(true);
    setQuestionsError(false);
    try {
      const response = await axios.get(`${BASE_URL}/questions/${title}`);
      setQuestions(response.data);
      sessionStorage.setItem("questions", JSON.stringify(response.data));
      setCurrentQuestion(0);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions(null);
      setQuestionsError(true);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const transcribeAudio = async (blobUrl: string) => {
    setLoadingTranscription(true);
    try {
      const blob = await fetch(blobUrl).then((r) => r.blob());
      const base64data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result as string);
      });

      const response = await axios.post(
        `${BASE_URL}/transcribe`,
        { audioData: base64data },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const transcriptionText = response.data.text;

      if (transcriptionText) {
        setTranscription(transcriptionText.trim());
      } else {
        toastError("Transcription failed. Try again or type your answer instead.");
      }
    } catch (error) {
      console.error("Error during transcription:", error);
      toastError("Transcription failed. Try again or type your answer instead.");
    } finally {
      setLoadingTranscription(false);
      setIsAudioVisible(false);
    }
  };

  const onReRecord = () => {
    setTranscription(null);
    resetRecording();
    startRecording();
  };

  const onFinalize = async () => {
    if (!questions) return;
    try {
      setLoading(true);
      const response = await axios.post(`${FLASK_URL}/evaluate`, {
        question_id: questions[currentQuestion].id,
        user_answer: transcription,
      });
      console.log("Response:", response.data);
      setCurrentScore(response.data.score);
      setAnswers((prev) => [...prev, transcription || "No answer"]);
      setScores((prev) => [...prev, response.data.score]);
      setFeedback((prev) => [...prev, response.data.feedback ?? ""]);
    } catch (error) {
      console.error("Error submitting answer:", error);
      toastError("Failed to submit answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (questions && currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTranscription(null);
      setCurrentScore(null);
      setShowScore(false);
      setIsAudioVisible(false);
      resetRecording();
    }
  };

  useEffect(() => {
    if (currentScore !== null) {
      setShowScore(true);
      setTimeout(() => {
        setScoreVisible(true);
      }, 10);
    } else {
      setScoreVisible(false);
      setTimeout(() => {
        setShowScore(false);
      }, 300);
    }
  }, [currentScore]);

  const onSubmission = async () => {
    if (!user || !questions || !Array.isArray(questions)) return;  // Ensure questions is an array
  
    // Prepare the data for the POST request
    const questionsData = questions.map((q) => ({
      id: q.id,
      sample_answer: q.sample_answer,
    }));
  
    const dataToSend = {
      jobTitle,
      answers,
      scores,
      feedback,  // the backend requires one feedback string per answer
      questions: questionsData,  // Ensure questions is an array of objects with necessary properties
      sample_answers: questionsData.map((q) => q.sample_answer),
    };
  
    try {
      setIsSubmitting(true);
      const response = await axios.post(`${BASE_URL}/save-session`, dataToSend, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (response.status === 200) {
        sessionStorage.removeItem("questions");
        localStorage.removeItem("selectedJobTitle");
        navigate(`/results/${response.data.id}`);
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
      toastError("Failed to submit answers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  


  const total = questions?.length || 0;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <MainLayout title="Interview" size="narrow">
      <div className="container-page">
        <PageHeader
          eyebrow="Interview simulation"
          title={jobTitle || "Interview practice"}
          description="Listen to each question, answer out loud, then review your score."
          actions={
            jobTitle && (
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <RefreshCw />
                Change role
              </Button>
            )
          }
        />

        <div className="mb-4 flex items-center gap-4">
          <Progress
            value={((currentQuestion + 1) / (total || 1)) * 100}
            className="flex-1"
          />
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {pad(total ? currentQuestion + 1 : 0)} / {pad(total)}
          </span>
        </div>

        <div className="surface relative flex min-h-[420px] flex-col overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full bg-sky-100/80 blur-3xl" />

          <div className="relative flex flex-1 flex-col gap-5 p-4 sm:p-8">
            {!jobTitle && !loadingQuestions && (
              <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                <AiAvatar className="h-12 w-12" />
                <p className="mt-4 font-display text-2xl">Choose a role to begin</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Questions are tailored to the job you're preparing for.
                </p>
                <Button className="mt-6" onClick={() => setOpen(true)}>
                  Choose role
                </Button>
              </div>
            )}
            {jobTitle && questionsError && !loadingQuestions && (
              <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                <p className="font-display text-2xl">Couldn't load questions</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Check your connection and try again.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => fetchQuestions(jobTitle)}
                >
                  <RefreshCw />
                  Try again
                </Button>
              </div>
            )}
            <QuestionDisplay
              question={questions ? questions[currentQuestion] : undefined}
              loading={loadingQuestions}
            />
            <SpeechEngine
              audio={audio}
              transcription={transcription}
              setTranscription={setTranscription}
              isAudioVisible={isAudioVisible}
              loadingTranscription={loadingTranscription}
              onReRecord={onReRecord}
              onFinalize={onFinalize}
              startRecording={startRecording}
              resetRecording={resetRecording}
              loading={loading}
              showScore={showScore}
            />
            {showScore && (
              <div
                className={`flex items-start gap-3 transition-all duration-300 ease-out ${
                  scoreVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
              >
                <AiAvatar />
                <div className="max-w-[85%] flex-1 rounded-2xl rounded-tl-md border border-border bg-muted/60 p-4 sm:p-5">
                  <div className="flex items-center gap-4">
                    <ScoreRing value={currentScore ?? 0} size={56} />
                    <div>
                      <p className="eyebrow">Your score</p>
                      <p className="mt-1 text-[15px]">
                        Your answer scored{" "}
                        <span className={`font-mono font-medium ${getScoreColor(currentScore ?? 0)}`}>
                          {currentScore}
                        </span>{" "}
                        points.
                      </p>
                      {feedback[currentQuestion] && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {feedback[currentQuestion]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 border-t border-border pt-4">
                    <p className="eyebrow mb-2">Sample answer</p>
                    <p className="text-[15px] leading-relaxed text-muted-foreground">
                      {questions && questions[currentQuestion].sample_answer}
                    </p>
                  </div>
                  <div className="mt-5 flex justify-end">
                    {currentQuestion < questions!.length - 1 ? (
                      <Button onClick={handleNextQuestion} className="w-full sm:w-auto">
                        Next question
                        <ArrowRight />
                      </Button>
                    ) : !isSubmitting ? (
                      <Button onClick={() => onSubmission()} className="w-full sm:w-auto">
                        Submit answers
                        <Check />
                      </Button>
                    ) : (
                      <LoadingButton className="w-full sm:w-auto" text="Submitting..." />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {questions && transcription === null && !loadingTranscription && (
            <div className="relative flex flex-col items-center gap-3 border-t border-border/70 px-4 py-8">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loadingQuestions || !questions}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
                className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 active:scale-95 disabled:opacity-40 ${
                  isRecording
                    ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25"
                    : "bg-mariner-950 text-white shadow-lg shadow-mariner-950/20 hover:bg-mariner-900"
                }`}
              >
                {isRecording && (
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-destructive" />
                )}
                {isRecording ? (
                  <Square size={20} className="relative fill-current" />
                ) : (
                  <Mic size={24} />
                )}
              </button>
              <p className="font-mono text-xs text-muted-foreground">
                {isRecording ? (
                  <>
                    <span className="text-destructive">●</span> Recording ·{" "}
                    {remainingTime}s left
                  </>
                ) : (
                  "Tap to answer"
                )}
              </p>
              {!isRecording && (
                <button
                  type="button"
                  onClick={() => setTranscription("")}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Type your answer instead
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <JobSelectionModal
        canCancel={!!jobTitle}
        open={open}
        setOpen={setOpen}
        onSelectJob={handleSelectJob}
      />
    </MainLayout>
  );
};

export default InterviewSimulation;
