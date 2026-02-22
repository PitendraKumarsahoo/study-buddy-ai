import { supabase } from "@/integrations/supabase/client";

export async function logActivity(action: string, mode: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("activity_logs").insert({ user_id: user.id, action, mode });
}

export async function saveConversation(
  mode: string,
  title: string,
  messages: { role: string; content: string }[],
  existingId?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  if (existingId) {
    const { data } = await supabase
      .from("conversations")
      .update({ messages: messages as any, title, updated_at: new Date().toISOString() })
      .eq("id", existingId)
      .select("id")
      .maybeSingle();
    return data?.id ?? existingId;
  }

  const { data } = await supabase
    .from("conversations")
    .insert({ user_id: user.id, mode, title, messages: messages as any })
    .select("id")
    .maybeSingle();
  return data?.id ?? null;
}
