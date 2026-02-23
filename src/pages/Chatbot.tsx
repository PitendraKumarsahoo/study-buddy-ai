import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { streamAI } from "@/lib/ai";
import { logActivity, saveConversation } from "@/lib/activity";
import { supabase } from "@/integrations/supabase/client";
import ChatMessage from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chatbot() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
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
      const { data } = await supabase.from("conversations").select("messages, title").eq("id", id).maybeSingle();
      if (data?.messages) {
        setMessages(data.messages as Msg[]);
        setConvId(id);
      }
      setLoadingConv(false);
    };
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Msg = { role: "user", content: input };
    const userText = input;
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    let assistantContent = "";
    const upsert = (chunk: string) => {
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
      messages: allMessages,
      mode: "chatbot",
      onDelta: upsert,
      onDone: async () => {
        setLoading(false);
        const finalMsgs = [...allMessages, { role: "assistant" as const, content: assistantContent }];
        const id = await saveConversation("chatbot", userText.slice(0, 60), finalMsgs, convId ?? undefined);
        if (id) setConvId(id);
        logActivity(`Chat: ${userText.slice(0, 50)}`, "chatbot");
      },
      onError: (err) => {
        toast({ title: "Error", description: err, variant: "destructive" });
        setLoading(false);
      },
    });
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-accent" />
            AI Student Chatbot
          </h1>
          <p className="text-muted-foreground mt-1">Ask anything — academics, careers, study tips, and more.</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => { setMessages([]); setConvId(null); setSearchParams({}); }}>
            <Trash2 className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 min-h-[400px] max-h-[60vh] overflow-y-auto space-y-4">
        {loadingConv ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm space-y-3">
            <MessageSquare className="h-12 w-12 opacity-30" />
            <p>Start a conversation with your AI assistant...</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["How to prepare for placements?", "Explain REST APIs", "Tips for final year project"].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-3 py-1.5 rounded-full bg-muted text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2">
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
