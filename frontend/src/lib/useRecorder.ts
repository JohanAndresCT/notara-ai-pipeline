import { useEffect, useRef, useState } from "react";

// Shared microphone recording for dictation (HU11) and voice comments (HU12).
// Limits follow DEC-213: 30 s (auto stop slightly earlier to stay inside the backend limit) and 2 MB.
export const MAX_RECORDING_SECONDS = 30;
export const MAX_RECORDING_BYTES = 2 * 1024 * 1024;
const AUTO_STOP_MS = 29_500;
const PREFERRED_TYPES = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm", "audio/mp4"];

export const recorderMessages = {
  micDenied: "No pudimos acceder al micrófono. Revisa los permisos del navegador para este sitio.", // M-04
  unsupported: "La grabación no está disponible en este navegador o conexión.", // M-04b
  autoStopped: "La grabación se detuvo al llegar a 30 segundos.", // M-05
  tooLarge: "La grabación es demasiado grande (máximo 2 MB).", // M-05b
};

export type RecorderStatus = "idle" | "requesting" | "recording";

export function isRecordingSupported() {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined"
  );
}

export function useRecorder(onComplete: (audio: Blob, autoStopped: boolean) => void) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<number | null>(null);
  const autoStopRef = useRef<number | null>(null);
  const autoStoppedRef = useRef(false);
  const mountedRef = useRef(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  function clearTimers() {
    if (tickRef.current !== null) window.clearInterval(tickRef.current);
    if (autoStopRef.current !== null) window.clearTimeout(autoStopRef.current);
    tickRef.current = null;
    autoStopRef.current = null;
  }

  function releaseStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false; // a recording stopped by leaving the page is discarded
      clearTimers();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      releaseStream();
    };
  }, []);

  function stop() {
    clearTimers();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  /** Starts recording. Resolves to an error message when the microphone cannot be used. */
  async function start(): Promise<string | null> {
    if (!isRecordingSupported()) return recorderMessages.unsupported;
    setStatus("requesting");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setStatus("idle");
      return recorderMessages.micDenied;
    }
    streamRef.current = stream;
    chunksRef.current = [];
    autoStoppedRef.current = false;
    const mimeType = PREFERRED_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      releaseStream();
      const audio = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" });
      chunksRef.current = [];
      if (!mountedRef.current) return;
      setStatus("idle");
      onCompleteRef.current(audio, autoStoppedRef.current);
    };
    recorderRef.current = recorder;
    recorder.start();
    setStatus("recording");
    setElapsed(0);
    const startedAt = Date.now();
    tickRef.current = window.setInterval(() => {
      setElapsed(Math.min(MAX_RECORDING_SECONDS, (Date.now() - startedAt) / 1000));
    }, 250);
    autoStopRef.current = window.setTimeout(() => {
      autoStoppedRef.current = true;
      stop();
    }, AUTO_STOP_MS);
    return null;
  }

  const remaining = Math.max(0, Math.ceil(MAX_RECORDING_SECONDS - elapsed));
  return { status, remaining, start, stop, supported: isRecordingSupported() };
}

export function formatCountdown(seconds: number) {
  return `0:${String(seconds).padStart(2, "0")}`;
}
