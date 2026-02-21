import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen, MessageSquare, FileText, Newspaper, Compass, Mic,
  ArrowRight, Activity, Clock, Sparkles, GraduationCap,
} from "lucide-react";

const tools = [
  { to: "/study", label: "Study Assistant", icon: BookOpen, desc: "Notes, quizzes, flashcards" },
  { to: "/chat", label: "AI Chatbot", icon: MessageSquare, desc: "Ask anything" },
  { to: "/resume", label: "Resume Builder", icon: FileText, desc: "Professional resumes" },
  { to: "/voice-notes", label: "Voice to Notes", icon: Mic, desc: "Record & summarize" },
  { to: "/news-check", label: "News Checker", icon: Newspaper, desc: "Fact-check news" },
  { to: "/recommendations", label: "For You", icon: Compass, desc: "Personalized suggestions" },
];

const recentActivity = [
  { action: "Generated notes on Machine Learning", time: "Just now", icon: BookOpen },
  { action: "Created a professional resume", time: "2 hours ago", icon: FileText },
  { action: "Checked news article credibility", time: "Yesterday", icon: Newspaper },
];

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";

  return (
    <div className="container max-w-6xl py-8 space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
          <GraduationCap className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {displayName}!</h1>
          <p className="text-muted-foreground">What would you like to work on today?</p>
        </div>
      </div>

      {/* Quick Access Grid */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Quick Access
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tools.map((t) => (
            <Link key={t.to} to={t.to}>
              <Card className="hover:border-primary/40 hover:shadow-card transition-all duration-200 group cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <t.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-auto" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Activity & Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.action}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {item.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Try these to get the most out of StudyAI:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">1</span>
                Ask the Study Assistant to explain any topic
              </li>
              <li className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">2</span>
                Record a lecture with Voice-to-Notes
              </li>
              <li className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">3</span>
                Generate your professional resume
              </li>
            </ul>
            <Link to="/study">
              <Button size="sm" className="mt-2 gap-1">
                Start Now <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
