import { RotateCcw, Send } from "lucide-react";
import { Button } from "./ui/button";
import LoadingButton from "./ui/loading-button";
import { Textarea } from "./ui/textarea";

type SpeechEngineProps = {
  audio: string | null;
  transcription: string | null;
  setTranscription: (transcription: string) => void;
  isAudioVisible: boolean;
  loadingTranscription: boolean;
  onReRecord: () => void;
  onFinalize: () => void;
  startRecording: () => void;
  resetRecording: () => void;
  loading: boolean;
  showScore: boolean;
};

const SpeechEngine = ({
  audio,
  transcription,
  setTranscription,
  isAudioVisible,
  loadingTranscription,
  onReRecord,
  onFinalize,
  loading,
  showScore,
}: SpeechEngineProps) => {
  if (!isAudioVisible && transcription === null) return null;

  return (
    <div className="flex w-full animate-fade-up justify-end">
      <div className="w-full max-w-[92%] rounded-2xl rounded-tr-md border border-primary/25 bg-primary/[0.07] p-3 sm:max-w-[80%] sm:p-4">
        <p className="eyebrow mb-2 text-primary/80">Your answer</p>

        {isAudioVisible && audio && !transcription && (
          <div className="flex flex-col gap-3">
            <audio controls src={audio} className="h-10 w-full" />
            {loadingTranscription && (
              <LoadingButton
                variant="ghost"
                className="self-start"
                text="Transcribing..."
              />
            )}
          </div>
        )}

        {transcription !== null &&
          (showScore ? (
            <p className="whitespace-normal break-words text-[15px] leading-relaxed">
              {transcription}
            </p>
          ) : (
            <>
              <Textarea
                aria-label="Your answer"
                autoFocus={!audio}
                placeholder="Type your answer here"
                className="min-h-[160px] bg-white text-[15px]"
                onChange={(e) => setTranscription(e.target.value)}
                value={transcription}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {audio
                  ? "Review and edit the transcription before submitting."
                  : "Write your answer as you would say it in the interview."}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                <Button variant="outline" onClick={onReRecord} disabled={loading}>
                  <RotateCcw />
                  {audio ? "Re-record" : "Record instead"}
                </Button>
                {loading ? (
                  <LoadingButton text="Scoring..." />
                ) : (
                  <Button onClick={onFinalize} disabled={!transcription.trim()}>
                    Finalize
                    <Send />
                  </Button>
                )}
              </div>
            </>
          ))}
      </div>
    </div>
  );
};

export default SpeechEngine;
