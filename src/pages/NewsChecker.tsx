import { useState } from "react";
import { streamAI } from "@/lib/ai";
import { logActivity } from "@/lib/activity";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Newspaper, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export default function NewsChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const check = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult("");

    let content = "";
    await streamAI({
      messages: [{ role: "user", content: `Analyze this news for credibility and potential misinformation:\n\n"${text}"` }],
      mode: "fake_news",
      onDelta: (chunk) => {
        content += chunk;
        setResult(content);
      },
      onDone: () => {
        setLoading(false);
        logActivity(`Checked news article credibility`, "fake_news");
      },
      onError: (err) => {
        toast({ title: "Error", description: err, variant: "destructive" });
        setLoading(false);
      },
    });
  };

  return (
    <div className="container max-w-3xl py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Newspaper className="h-8 w-8 text-warning" />
          News Fact-Checker
        </h1>
        <p className="text-muted-foreground mt-1">Paste a news headline or article to analyze its credibility using AI.</p>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="Paste a news headline or article text here..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          className="text-base"
        />
        <Button onClick={check} disabled={loading || !text.trim()} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Analyze
        </Button>
      </div>

      {result && (
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <h2 className="font-semibold text-lg mb-4">Analysis Result</h2>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
