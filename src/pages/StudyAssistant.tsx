import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { streamAI } from "@/lib/ai";
import { logActivity, saveConversation } from "@/lib/activity";
import { supabase } from "@/integrations/supabase/client";
import ChatMessage from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, HelpCircle, Layers, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Mode = "explain" | "notes" | "quiz" | "flashcards";

const modes: { value: Mode; label: string; icon: typeof BookOpen; prompt: string }[] = [
  { value: "explain", label: "Explain", icon: BookOpen, prompt: "Explain this topic in simple words with examples: " },
  { value: "notes", label: "Notes", icon: FileText, prompt: "Generate detailed, well-structured notes on: " },
  { value: "quiz", label: "Quiz", icon: HelpCircle, prompt: "Generate 5 multiple-choice quiz questions with answers on: " },
  { value: "flashcards", label: "Flashcards", icon: Layers, prompt: "Generate 10 flashcards (term and definition pairs) on: " },
];

export default function StudyAssistant() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>("explain");
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | null>(searchParams.get("conv"));
  const [loadingConv, setLoadingConv] = useState(!!searchParams.get("conv"));
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load existing conversation
  useEffect(() => {
    const id = searchParams.get("conv");
    if (!id) return;
    const load = async () => {
      const { data } = await supabase.from("conversations").select("messages").eq("id", id).maybeSingle();
      if (data?.messages) {
        setMessages(data.messages as { role: "user" | "assistant"; content: string }[]);
        setConvId(id);
      }
      setLoadingConv(false);
    };
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    const modeConfig = modes.find(m => m.value === mode)!;
    const userMessage = `${modeConfig.prompt}${topic}`;
    const userDisplay = topic;
    const currentTopic = topic;
    setTopic("");
    const newMessages = [...messages, { role: "user" as const, content: userDisplay }];
    setMessages(newMessages);
    setLoading(true);

    let assistantContent = "";
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    await streamAI({
      messages: [{ role: "user", content: userMessage }],
      mode: "study",
      onDelta: updateAssistant,
      onDone: async () => {
        setLoading(false);
        const allMsgs = [...newMessages, { role: "assistant" as const, content: assistantContent }];
        const id = await saveConversation("study", `${modeConfig.label}: ${currentTopic}`, allMsgs, convId ?? undefined);
        if (id) setConvId(id);
        logActivity(`Generated ${modeConfig.label.toLowerCase()} on ${currentTopic}`, "study");
      },
      onError: (err) => {
        toast({ title: "Error", description: err, variant: "destructive" });
        setLoading(false);
      },
    });
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          AI Study Assistant
        </h1>
        <p className="text-muted-foreground mt-1">Enter a topic and choose what you need — explanations, notes, quizzes, or flashcards.</p>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList className="grid grid-cols-4 w-full">
          {modes.map(m => (
            <TabsTrigger key={m.value} value={m.value} className="flex items-center gap-1.5">
              <m.icon className="h-4 w-4" /> {m.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Chat area */}
      <div className="bg-card border border-border rounded-xl p-4 min-h-[400px] max-h-[60vh] overflow-y-auto space-y-4">
        {loadingConv ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Enter a topic below to get started...
          </div>
        ) : null}
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder={`Enter a topic (e.g., "Machine Learning", "Data Structures")...`}
          value={topic}
          onChange={e => setTopic(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !topic.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
