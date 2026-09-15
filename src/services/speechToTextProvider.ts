/**
 * SpeechToTextProvider Abstraction
 * Decouples speech-to-text recording, recognition, and transcription
 * from UI components. Can swap browser SpeechRecognition, Whisper, or cloud STT APIs.
 */

export type STTState = 'idle' | 'recording' | 'processing' | 'completed' | 'error';
export type STTLanguage = 'en-IN' | 'hi-IN';

export interface STTEventCallbacks {
  onInterimTranscript?: (interim: string) => void;
  onFinalTranscript?: (final: string) => void;
  onStateChange?: (state: STTState) => void;
  onError?: (errorMessage: string) => void;
}

export interface SpeechToTextProvider {
  isSupported(): boolean;
  start(callbacks: STTEventCallbacks): Promise<void>;
  stop(): Promise<string>;
  cancel(): void;
  getState(): STTState;
  getLanguage(): STTLanguage;
  setLanguage(lang: STTLanguage): void;
}

export class WebSpeechToTextProvider implements SpeechToTextProvider {
  private recognition: any = null;
  private state: STTState = 'idle';
  private language: STTLanguage = 'en-IN';
  private accumulatedText: string = '';
  private interimText: string = '';
  private callbacks: STTEventCallbacks = {};

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = this.language;

        recognition.onstart = () => {
          this.setState('recording');
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript + ' ';
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          this.interimText = interim;
          if (this.callbacks.onInterimTranscript) {
            this.callbacks.onInterimTranscript(interim);
          }
          if (final) {
            this.accumulatedText = (this.accumulatedText ? this.accumulatedText + ' ' : '') + final.trim();
            if (this.callbacks.onFinalTranscript) {
              this.callbacks.onFinalTranscript(this.accumulatedText);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('[SpeechToTextProvider] Recognition error:', event.error);
          this.setState('error');
          let msg = `Speech recognition error: ${event.error}`;
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            msg = 'Microphone access is restricted in this browser frame. You can type or upload a file instead.';
          } else if (event.error === 'no-speech') {
            msg = 'No speech detected. Please speak into your microphone and try again.';
          }
          if (this.callbacks.onError) {
            this.callbacks.onError(msg);
          }
        };

        recognition.onend = () => {
          if (this.state === 'recording') {
            this.setState('completed');
          }
        };

        this.recognition = recognition;
      } catch (e) {
        console.warn('[SpeechToTextProvider] Failed to initialize SpeechRecognition:', e);
      }
    }
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  getState(): STTState {
    return this.state;
  }

  getLanguage(): STTLanguage {
    return this.language;
  }

  setLanguage(lang: STTLanguage): void {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  private setState(newState: STTState) {
    this.state = newState;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(newState);
    }
  }

  async start(callbacks: STTEventCallbacks): Promise<void> {
    this.callbacks = callbacks;
    this.accumulatedText = '';
    this.interimText = '';

    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      this.setState('error');
      const err = "Speech input isn't supported on this device/browser. You can type or upload a file instead.";
      if (callbacks.onError) callbacks.onError(err);
      return;
    }

    try {
      this.recognition.lang = this.language;
      this.recognition.start();
      this.setState('recording');
    } catch (err: any) {
      console.warn('[SpeechToTextProvider] Start error:', err);
      if (callbacks.onError) {
        callbacks.onError(err?.message || 'Unable to start microphone recording.');
      }
      this.setState('error');
    }
  }

  async stop(): Promise<string> {
    this.setState('processing');
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    const result = (this.accumulatedText + (this.interimText ? ' ' + this.interimText : '')).trim();
    this.setState('completed');
    return result;
  }

  cancel(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // ignore
      }
    }
    this.accumulatedText = '';
    this.interimText = '';
    this.setState('idle');
  }
}

// Export singleton default STT provider
export const defaultSTTProvider: SpeechToTextProvider = new WebSpeechToTextProvider();
