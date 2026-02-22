import { useState } from "react";
import { streamAI } from "@/lib/ai";
import { logActivity } from "@/lib/activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export default function Recommendations() {
  const [interests, setInterests] = useState("");
  const [skills, setSkills] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getRecommendations = async () => {
    if (!interests.trim() && !skills.trim() && !goal.trim()) return;
    setLoading(true);
    setResult("");

    const prompt = `Based on the following student profile, suggest personalized courses, skills, and a learning roadmap:\n\nInterests: ${interests || "Not specified"}\nCurrent Skills: ${skills || "Not specified"}\nCareer Goal: ${goal || "Not specified"}`;

    let content = "";
    await streamAI({
      messages: [{ role: "user", content: prompt }],
      mode: "recommendations",
      onDelta: (chunk) => {
        content += chunk;
        setResult(content);
      },
      onDone: () => {
        setLoading(false);
        logActivity(`Got recommendations for ${goal || interests || "profile"}`, "recommendations");
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
          <Compass className="h-8 w-8 text-primary" />
          Smart Recommendations
        </h1>
        <p className="text-muted-foreground mt-1">Get personalized course and skill suggestions based on your goals.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div><Label>Your Interests</Label><Input placeholder="AI, Web Development, Data Science..." value={interests} onChange={e => setInterests(e.target.value)} /></div>
        <div><Label>Current Skills</Label><Input placeholder="Python, JavaScript, SQL..." value={skills} onChange={e => setSkills(e.target.value)} /></div>
        <div><Label>Career Goal</Label><Input placeholder="ML Engineer, Full Stack Developer..." value={goal} onChange={e => setGoal(e.target.value)} /></div>
        <Button onClick={getRecommendations} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Get Recommendations
        </Button>
      </div>

      {result && (
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
