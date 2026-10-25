import { useState, useRef, useEffect, useCallback } from "react";
import { useToaster } from "../context/ToastContext";

export const useMicrophone = (duration: number = 60) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audio, setAudio] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(duration);

  const microphone = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { toastError } = useToaster();

  const releaseStream = () => {
    // Stops the browser's "microphone in use" indicator.
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    if (isRecording) {
      startTimeRef.current = Date.now();
      countdownIntervalRef.current = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      microphone.current = new MediaRecorder(stream);

      microphone.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      microphone.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        const durationRecorded =
          (Date.now() - (startTimeRef.current || 0)) / 1000;
        if (durationRecorded >= 1) {
          setAudio(audioUrl);
        } else {
          toastError("That recording was too short. Hold on a little longer.");
        }
        audioChunksRef.current = [];
        releaseStream();
      };

      microphone.current.start();
      setRemainingTime(duration);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      releaseStream();
      toastError(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone access is blocked. Allow it in your browser settings to answer."
          : "Failed to start recording. Please check your microphone."
      );
    }
  };

  const stopRecording = useCallback(() => {
    if (microphone.current && microphone.current.state !== "inactive") {
      microphone.current.stop();
    }
    setIsRecording(false);
    setRemainingTime(duration);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  }, [duration]);

  // Stop automatically when the time limit is reached.
  useEffect(() => {
    if (isRecording && remainingTime <= 0) {
      stopRecording();
    }
  }, [isRecording, remainingTime, stopRecording]);

  // Release the microphone if the user leaves mid-recording.
  useEffect(() => () => releaseStream(), []);

  const resetRecording = () => {
    if (isRecording) {
      stopRecording();
    }

    setAudio(null);
    setRemainingTime(duration);
    audioChunksRef.current = [];
    startTimeRef.current = null;
  };

  return {
    isRecording,
    audio,
    remainingTime,
    startRecording,
    stopRecording,
    resetRecording,
  };
};
