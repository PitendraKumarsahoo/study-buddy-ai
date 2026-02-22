import { useState, useRef, useCallback } from "react";
import { streamAI } from "@/lib/ai";
import { logActivity } from "@/lib/activity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, FileText, Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VoiceNotes() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not Supported", description: "Your browser doesn't support speech recognition. Try Chrome.", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = transcript;

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + " ";
        } else {
          interim = t;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (e: any) => {
      toast({ title: "Error", description: e.error, variant: "destructive" });
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }, [transcript, toast]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  const summarize = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setSummary("");
    let content = "";

    await streamAI({
      messages: [{ role: "user", content: `Summarize these lecture notes into well-structured, concise notes with headings and bullet points:\n\n${transcript}` }],
      mode: "study",
      onDelta: (chunk) => { content += chunk; setSummary(content); },
      onDone: () => {
        setLoading(false);
        logActivity("Summarized voice recording", "voice_notes");
      },
      onError: (err) => { toast({ title: "Error", description: err, variant: "destructive" }); setLoading(false); },
    });
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mic className="h-8 w-8 text-primary" />
          Voice to Notes
        </h1>
        <p className="text-muted-foreground mt-1">Record your lecture, then let AI summarize it into structured notes.</p>
      </div>

      {/* Recording Controls */}
      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`h-24 w-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : "bg-primary text-primary-foreground hover:scale-105"
            }`}
          >
            {isRecording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
          </button>
          <p className="text-sm text-muted-foreground">
            {isRecording ? "Recording... Click to stop" : "Click to start recording"}
          </p>
        </CardContent>
      </Card>

      {/* Transcript */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> Transcript</span>
            {transcript && (
              <Button variant="ghost" size="sm" onClick={() => copyText(transcript)}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your speech will appear here... You can also type or paste text."
            rows={6}
          />
          <Button onClick={summarize} disabled={!transcript.trim() || loading} className="mt-3 gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Summarize with AI
          </Button>
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> AI Summary</span>
              <Button variant="ghost" size="sm" onClick={() => copyText(summary)}>
                <Copy className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{summary}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
