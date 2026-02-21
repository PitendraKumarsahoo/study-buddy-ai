import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  BookOpen, MessageSquare, FileText, Newspaper, Compass, Sparkles,
  BrainCircuit, Zap, ArrowRight, GraduationCap,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "AI Study Assistant",
    description: "Get instant explanations, auto-generated notes, quizzes, and flashcards on any topic.",
    to: "/study",
    color: "text-primary",
  },
  {
    icon: MessageSquare,
    title: "Smart AI Chatbot",
    description: "Ask anything — academic questions, career advice, study tips. Your 24/7 mentor.",
    to: "/chat",
    color: "text-accent",
  },
  {
    icon: FileText,
    title: "Resume Generator",
    description: "Create professional resumes and cover letters instantly with AI-powered formatting.",
    to: "/resume",
    color: "text-success",
  },
  {
    icon: Newspaper,
    title: "News Fact-Checker",
    description: "Analyze any news headline for credibility, bias, and potential misinformation.",
    to: "/news-check",
    color: "text-warning",
  },
  {
    icon: Compass,
    title: "Smart Recommendations",
    description: "Get personalized course, skill, and career path suggestions tailored to your goals.",
    to: "/recommendations",
    color: "text-primary",
  },
];

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>
        <div className="container relative py-24 md:py-32 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary animate-fade-in">
            <Sparkles className="h-4 w-4" />
            AI-Powered Student Assistant
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Study Smarter with{" "}
            <span className="gradient-text">Generative AI</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Your intelligent companion for studying, career preparation, and academic productivity. Powered by cutting-edge AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {user ? (
              <Link to="/study">
                <Button size="lg" className="gap-2 animate-pulse-glow">
                  <BrainCircuit className="h-5 w-5" /> Start Studying <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="gap-2 animate-pulse-glow">
                  <Zap className="h-5 w-5" /> Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Excel</h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Five powerful AI tools designed specifically for students, all in one place.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Link
              key={f.to}
              to={user ? f.to : "/auth"}
              className="group bg-card border border-border rounded-xl p-6 hover:shadow-card hover:border-primary/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <f.icon className={`h-10 w-10 ${f.color} mb-4`} />
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Try it <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold">StudyAI</span> — Final Year Project
          </div>
          <p>Built with React, Lovable Cloud & Generative AI</p>
        </div>
      </footer>
    </div>
  );
}
