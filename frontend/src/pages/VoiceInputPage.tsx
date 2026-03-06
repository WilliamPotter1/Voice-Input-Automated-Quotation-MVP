import { Mic, Upload, Languages, Sparkles, Loader2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { transcribeAudio, extractQuoteItems } from '../api/client';
import { useVoiceStore } from '../stores/voiceStore';
import { useAuthStore } from '../stores/authStore';

const LANGUAGES = [
  { code: 'de', label: 'German' },
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italian' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
] as const;

const ALLOWED_ACCEPT = 'audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a,audio/m4a,audio/webm';
const MAX_FILE_MB = 25;

export function VoiceInputPage() {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const navigate = useNavigate();
  const { transcribedText, setTranscribedText, selectedLanguage, setSelectedLanguage } = useVoiceStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const extractMutation = useMutation({
    mutationFn: () => extractQuoteItems(transcribedText!, { language: selectedLanguage }),
    onSuccess: (data) => {
      if (data.items.length > 0) {
        navigate('/quotes/new', { state: { extractedItems: data.items } });
        toast.success('Quote items extracted — edit and save');
      } else {
        toast.error('No items could be extracted from the text');
      }
    },
    onError: (e: Error) => toast.error(e.message || 'Extraction failed'),
  });

  const transcribeMutation = useMutation({
    mutationFn: ({ file, language }: { file: File; language?: string }) =>
      transcribeAudio(file, { language }),
    onSuccess: (data) => {
      setTranscribedText(data.text);
      toast.success('Transcription complete');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Transcription failed');
    },
  });

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (chunksRef.current.length === 0) return;
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        setUploading(true);
        try {
          await transcribeMutation.mutateAsync({ file, language: selectedLanguage });
        } finally {
          setUploading(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      toast.success('Recording started');
    } catch {
      toast.error('Microphone access denied or not available');
      setRecording(false);
    }
  }, [selectedLanguage, transcribeMutation]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
    toast('Processing recording…');
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`File too large. Max ${MAX_FILE_MB} MB.`);
        return;
      }
      transcribeMutation.mutate({ file, language: selectedLanguage });
      e.target.value = '';
    },
    [selectedLanguage, transcribeMutation]
  );

  const isBusy = transcribeMutation.isPending || uploading;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Turn voice into quotes
        </h1>
        <p className="mt-2 max-w-xl text-slate-600">
          Record or upload audio. We transcribe it and extract line items so you can edit and save a professional quote.
        </p>
      </section>

      {/* Language */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Languages className="size-4 text-slate-500" />
            Language
          </span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
          >
            {LANGUAGES.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Record / Upload */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Add audio
        </h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            disabled={isBusy}
            className={`relative flex flex-1 items-center justify-center gap-3 rounded-xl px-6 py-5 font-medium text-white transition disabled:opacity-50 ${
              recording
                ? 'bg-red-500 shadow-lg shadow-red-500/30 hover:bg-red-600'
                : 'bg-emerald-600 shadow-sm hover:bg-emerald-700'
            }`}
          >
            {recording && (
              <span className="absolute inset-0 animate-pulse rounded-xl bg-red-400/30" aria-hidden />
            )}
            <Mic className="relative size-6 shrink-0" />
            <span className="relative">
              {recording ? 'Stop recording' : 'Start recording'}
            </span>
          </button>
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-5 font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50">
            <Upload className="size-6 shrink-0 text-slate-500" />
            Upload file
            <input
              type="file"
              accept={ALLOWED_ACCEPT}
              onChange={handleFileSelect}
              className="sr-only"
              disabled={isBusy}
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          MP3, WAV, or M4A · max {MAX_FILE_MB} MB
        </p>
      </section>

      {/* Loading state */}
      {isBusy && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 px-5 py-4">
          <Loader2 className="size-5 shrink-0 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">Transcribing… This may take a few seconds.</p>
        </div>
      )}

      {/* Transcription + Extract */}
      {transcribedText !== null && transcribedText !== '' && !isBusy && (
        <section className="space-y-5">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Transcription
            </h3>
            <p className="whitespace-pre-wrap rounded-xl bg-slate-50/80 p-4 text-slate-700">
              {transcribedText}
            </p>
          </div>
          {isAuthenticated() ? (
            <button
              type="button"
              onClick={() => extractMutation.mutate()}
              disabled={extractMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
            >
              {extractMutation.isPending ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Extracting…
                </>
              ) : (
                <>
                  <Sparkles className="size-5" />
                  Extract to quote
                </>
              )}
            </button>
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-600">
              Sign in to create a quote from this transcription.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
