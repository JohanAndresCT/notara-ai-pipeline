// HU21 / CR-007 — browser client for the Gemini Live tutor session.
// The backend hands out a single-use ephemeral token whose setup (model, tutor
// instructions, audio output) is locked; the API key never reaches the browser.
// Microphone audio is streamed as 16 kHz PCM16; the tutor's voice arrives as 24 kHz PCM16.

export type TutorSession = { token: string; ws_url: string; model: string; max_seconds: number };

export type LiveHandlers = {
  onReady: () => void;
  onUserText: (text: string) => void;
  onTutorText: (text: string) => void;
  onTurnComplete: () => void;
  onSpeaking: (speaking: boolean) => void;
  onLevel: (level: number) => void;
  onError: (message: string) => void;
  onClose: () => void;
};

const INPUT_RATE = 16000;
const OUTPUT_RATE = 24000;

// AudioWorklet that forwards microphone frames to the main thread.
const WORKLET = `
class Capture extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) this.port.postMessage(channel.slice(0));
    return true;
  }
}
registerProcessor("notara-capture", Capture);
`;

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function floatToPcm16(samples: Float32Array) {
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return new Uint8Array(out.buffer);
}

function pcm16ToFloat(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const pcm = new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2));
  const out = new Float32Array(pcm.length);
  for (let i = 0; i < pcm.length; i += 1) out[i] = pcm[i] / 0x8000;
  return out;
}

export class LiveTutor {
  private ws: WebSocket | null = null;
  private micStream: MediaStream | null = null;
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private playhead = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private pending: Float32Array[] = [];
  private flushTimer: number | null = null;
  private closed = false;

  constructor(private readonly handlers: LiveHandlers) {}

  connect(session: TutorSession) {
    this.outputContext = new AudioContext({ sampleRate: OUTPUT_RATE });
    const ws = new WebSocket(`${session.ws_url}?access_token=${encodeURIComponent(session.token)}`);
    this.ws = ws;
    ws.onopen = () => {
      // Setup is locked in the token; this message only opens the session.
      ws.send(JSON.stringify({ setup: { model: session.model } }));
    };
    ws.onmessage = async (event) => {
      const raw = typeof event.data === "string" ? event.data : await (event.data as Blob).text();
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(raw);
      } catch {
        return;
      }
      this.handle(data);
    };
    ws.onerror = () => this.handlers.onError("No se pudo conectar con el tutor.");
    ws.onclose = () => {
      if (!this.closed) this.handlers.onClose();
      this.close();
    };
  }

  private handle(data: Record<string, unknown>) {
    if ("setupComplete" in data) {
      this.handlers.onReady();
      return;
    }
    const content = data.serverContent as
      | {
          modelTurn?: { parts?: { inlineData?: { data: string; mimeType: string } }[] };
          inputTranscription?: { text?: string };
          outputTranscription?: { text?: string };
          interrupted?: boolean;
          turnComplete?: boolean;
        }
      | undefined;
    if (!content) return;
    if (content.interrupted) this.stopPlayback();
    for (const part of content.modelTurn?.parts ?? []) {
      if (part.inlineData?.data) this.enqueue(pcm16ToFloat(part.inlineData.data));
    }
    if (content.inputTranscription?.text) this.handlers.onUserText(content.inputTranscription.text);
    if (content.outputTranscription?.text) this.handlers.onTutorText(content.outputTranscription.text);
    if (content.turnComplete) this.handlers.onTurnComplete();
  }

  private enqueue(samples: Float32Array) {
    const context = this.outputContext;
    if (!context || !samples.length) return;
    const buffer = context.createBuffer(1, samples.length, OUTPUT_RATE);
    buffer.copyToChannel(Float32Array.from(samples), 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    const startAt = Math.max(context.currentTime + 0.03, this.playhead);
    source.start(startAt);
    this.playhead = startAt + buffer.duration;
    this.sources.add(source);
    this.handlers.onSpeaking(true);
    source.onended = () => {
      this.sources.delete(source);
      if (!this.sources.size) this.handlers.onSpeaking(false);
    };
  }

  private stopPlayback() {
    this.sources.forEach((source) => {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    });
    this.sources.clear();
    this.playhead = 0;
    this.handlers.onSpeaking(false);
  }

  /** Starts streaming the microphone; returns false when permission is denied. */
  async startMicrophone(): Promise<boolean> {
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      return false;
    }
    const context = new AudioContext({ sampleRate: INPUT_RATE });
    this.inputContext = context;
    const url = URL.createObjectURL(new Blob([WORKLET], { type: "application/javascript" }));
    await context.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);
    const source = context.createMediaStreamSource(this.micStream);
    const node = new AudioWorkletNode(context, "notara-capture");
    node.port.onmessage = (event: MessageEvent<Float32Array>) => {
      this.pending.push(event.data);
      let peak = 0;
      for (let i = 0; i < event.data.length; i += 8) peak = Math.max(peak, Math.abs(event.data[i]));
      this.handlers.onLevel(peak);
    };
    source.connect(node);
    // ~100 ms packets keep latency low without flooding the socket.
    this.flushTimer = window.setInterval(() => this.flush(), 100);
    return true;
  }

  private flush() {
    if (!this.pending.length || this.ws?.readyState !== WebSocket.OPEN) return;
    const total = this.pending.reduce((sum, chunk) => sum + chunk.length, 0);
    const merged = new Float32Array(total);
    let offset = 0;
    for (const chunk of this.pending) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    this.pending = [];
    this.ws.send(
      JSON.stringify({
        realtimeInput: { audio: { data: toBase64(floatToPcm16(merged)), mimeType: `audio/pcm;rate=${INPUT_RATE}` } },
      }),
    );
  }

  sendText(text: string) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ realtimeInput: { text } }));
  }

  get isOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    if (this.flushTimer !== null) window.clearInterval(this.flushTimer);
    this.micStream?.getTracks().forEach((track) => track.stop());
    this.stopPlayback();
    void this.inputContext?.close().catch(() => undefined);
    void this.outputContext?.close().catch(() => undefined);
    if (this.ws && this.ws.readyState <= WebSocket.OPEN) this.ws.close();
  }
}
