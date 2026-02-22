import { useState } from "react";
import { streamAI } from "@/lib/ai";
import { logActivity } from "@/lib/activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export default function ResumeGenerator() {
  const [tab, setTab] = useState("resume");
  const [form, setForm] = useState({ name: "", email: "", education: "", skills: "", experience: "", projects: "" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const generate = async (type: string) => {
    setLoading(true);
    setResult("");

    let prompt = "";
    if (type === "resume") {
      prompt = `Generate a professional ATS-friendly resume for:\nName: ${form.name}\nEmail: ${form.email}\nEducation: ${form.education}\nSkills: ${form.skills}\nExperience: ${form.experience}\nProjects: ${form.projects}`;
    } else if (type === "cover") {
      prompt = `Generate a professional cover letter for:\nName: ${form.name}\nSkills: ${form.skills}\nExperience: ${form.experience}`;
    } else {
      prompt = `Analyze and suggest improvements for this resume info:\nName: ${form.name}\nEducation: ${form.education}\nSkills: ${form.skills}\nExperience: ${form.experience}\nProjects: ${form.projects}`;
    }

    let content = "";
    await streamAI({
      messages: [{ role: "user", content: prompt }],
      mode: "resume",
      onDelta: (chunk) => {
        content += chunk;
        setResult(content);
      },
      onDone: () => {
        setLoading(false);
        logActivity(`Generated ${type} for ${form.name || "user"}`, "resume");
      },
      onError: (err) => {
        toast({ title: "Error", description: err, variant: "destructive" });
        setLoading(false);
      },
    });
  };

  return (
    <div className="container max-w-5xl py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-success" />
          Resume & Cover Letter Generator
        </h1>
        <p className="text-muted-foreground mt-1">Fill in your details and let AI create a professional resume or cover letter.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Your Information</h2>
          <div className="grid gap-3">
            <div><Label>Full Name</Label><Input placeholder="John Doe" value={form.name} onChange={e => update("name", e.target.value)} /></div>
            <div><Label>Email</Label><Input placeholder="john@example.com" value={form.email} onChange={e => update("email", e.target.value)} /></div>
            <div><Label>Education</Label><Input placeholder="BTech CSE, XYZ University, 2024" value={form.education} onChange={e => update("education", e.target.value)} /></div>
            <div><Label>Skills</Label><Input placeholder="Python, React, ML, SQL..." value={form.skills} onChange={e => update("skills", e.target.value)} /></div>
            <div><Label>Experience</Label><Textarea placeholder="Intern at ABC Corp (Jun-Aug 2023)..." value={form.experience} onChange={e => update("experience", e.target.value)} rows={3} /></div>
            <div><Label>Projects</Label><Textarea placeholder="AI Chatbot, E-commerce site..." value={form.projects} onChange={e => update("projects", e.target.value)} rows={3} /></div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={() => generate("resume")} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />} Generate Resume
            </Button>
            <Button variant="secondary" onClick={() => generate("cover")} disabled={loading}>Generate Cover Letter</Button>
            <Button variant="outline" onClick={() => generate("improve")} disabled={loading}>Suggest Improvements</Button>
          </div>
        </div>

        {/* Output */}
        <div className="bg-card border border-border rounded-xl p-6 max-h-[70vh] overflow-y-auto">
          <h2 className="font-semibold text-lg mb-4">Generated Output</h2>
          {result ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              Fill in your details and click generate...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
