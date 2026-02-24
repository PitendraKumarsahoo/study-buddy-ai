import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BookOpen, MessageSquare, FileText, Newspaper, Compass, Mic,
  Activity, Clock, Search, Trash2, ArrowRight, History,
} from "lucide-react";
import { toast } from "sonner";

const modeIcons: Record<string, typeof BookOpen> = {
  study: BookOpen, chatbot: MessageSquare, resume: FileText,
  fake_news: Newspaper, recommendations: Compass, voice_notes: Mic,
};
const modeRoutes: Record<string, string> = {
  study: "/study", chatbot: "/chat", resume: "/resume",
  fake_news: "/news-check", recommendations: "/recommendations", voice_notes: "/voice-notes",
};
const modeLabels: Record<string, string> = {
  study: "Study Assistant", chatbot: "AI Chatbot", resume: "Resume Builder",
  fake_news: "News Checker", recommendations: "For You", voice_notes: "Voice Notes",
};
const allModes = Object.keys(modeLabels);

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

type Conversation = { id: string; title: string; mode: string; updated_at: string; created_at: string };

export default function ConversationHistory() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("conversations")
      .select("id, title, mode, updated_at, created_at")
      .order("updated_at", { ascending: false })
      .limit(200);
    setConversations((data as Conversation[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchConversations(); }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete conversation");
      return;
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
    toast.success("Conversation deleted");
  };

  const filtered = conversations.filter((c) => {
    const matchesSearch = search === "" || c.title.toLowerCase().includes(search.toLowerCase());
    const matchesMode = modeFilter === "all" || c.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  return (
    <div className="container max-w-4xl py-8 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <History className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Conversation History</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={modeFilter} onValueChange={setModeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All tools" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tools</SelectItem>
            {allModes.map((m) => (
              <SelectItem key={m} value={m}>{modeLabels[m]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {search || modeFilter !== "all"
              ? "No conversations match your filters."
              : "No conversations yet. Start using a tool to see your history here!"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((conv) => {
            const Icon = modeIcons[conv.mode] || Activity;
            const route = modeRoutes[conv.mode] || "/chat";
            const label = modeLabels[conv.mode] || conv.mode;
            return (
              <Card key={conv.id} className="group hover:border-primary/40 hover:shadow-card transition-all duration-200">
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
                          This will permanently delete "{conv.title}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(conv.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
    </div>
  );
}
