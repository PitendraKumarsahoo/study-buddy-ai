import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BookOpen, MessageSquare, FileText, Newspaper, Compass, Mic,
  ArrowRight, Activity, Clock, Sparkles, GraduationCap, History, Trash2,
} from "lucide-react";
import { toast } from "sonner";

const tools = [
  { to: "/study", label: "Study Assistant", icon: BookOpen, desc: "Notes, quizzes, flashcards" },
  { to: "/chat", label: "AI Chatbot", icon: MessageSquare, desc: "Ask anything" },
  { to: "/resume", label: "Resume Builder", icon: FileText, desc: "Professional resumes" },
  { to: "/voice-notes", label: "Voice to Notes", icon: Mic, desc: "Record & summarize" },
  { to: "/news-check", label: "News Checker", icon: Newspaper, desc: "Fact-check news" },
  { to: "/recommendations", label: "For You", icon: Compass, desc: "Personalized suggestions" },
];

const modeIcons: Record<string, typeof BookOpen> = {
  study: BookOpen,
  chatbot: MessageSquare,
  resume: FileText,
  fake_news: Newspaper,
  recommendations: Compass,
  voice_notes: Mic,
};

const modeRoutes: Record<string, string> = {
  study: "/study",
  chatbot: "/chat",
  resume: "/resume",
  fake_news: "/news-check",
  recommendations: "/recommendations",
  voice_notes: "/voice-notes",
};

const modeLabels: Record<string, string> = {
  study: "Study Assistant",
  chatbot: "AI Chatbot",
  resume: "Resume Builder",
  fake_news: "News Checker",
  recommendations: "For You",
  voice_notes: "Voice Notes",
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

type ActivityItem = { action: string; mode: string; created_at: string };
type ConversationItem = { id: string; title: string; mode: string; updated_at: string };

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [totalConvs, setTotalConvs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [actRes, convRes, recentConvs] = await Promise.all([
        supabase.from("activity_logs").select("action, mode, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("conversations").select("id", { count: "exact", head: true }),
        supabase.from("conversations").select("id, title, mode, updated_at").order("updated_at", { ascending: false }).limit(10),
      ]);
      setActivities((actRes.data as ActivityItem[]) ?? []);
      setConversations((recentConvs.data as ConversationItem[]) ?? []);
      setTotalConvs(convRes.count ?? 0);
      setLoading(false);
    };
    fetchData();
  }, [user]);

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

      {/* Conversation History */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Recent Conversations
          </h2>
          <Link to="/history">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No conversations yet. Start using a tool above to see your history here!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {conversations.map((conv) => {
              const Icon = modeIcons[conv.mode] || Activity;
              const route = modeRoutes[conv.mode] || "/chat";
              const label = modeLabels[conv.mode] || conv.mode;
              return (
                <Card key={conv.id} className="hover:border-primary/40 hover:shadow-card transition-all duration-200 group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Link to={`${route}?conv=${conv.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">{conv.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{label}</span>
                          <span>·</span>
                          <Clock className="h-3 w-3" />
                          <span>{timeAgo(conv.updated_at)}</span>
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{conv.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              const { error } = await supabase.from("conversations").delete().eq("id", conv.id);
                              if (error) { toast.error("Failed to delete"); return; }
                              setConversations((prev) => prev.filter((c) => c.id !== conv.id));
                              toast.success("Conversation deleted");
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
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
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet. Try one of the tools above!</p>
            ) : (
              activities.map((item, i) => {
                const Icon = modeIcons[item.mode] || Activity;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.action}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeAgo(item.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm">Total Conversations</span>
              <span className="font-bold text-primary">{totalConvs}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm">Activities Logged</span>
              <span className="font-bold text-primary">{activities.length > 0 ? "Active" : "New"}</span>
            </div>
            <Link to="/study">
              <Button size="sm" className="mt-2 gap-1">
                Start Studying <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
