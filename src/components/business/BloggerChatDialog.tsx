import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Send, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  businessId: string;
  businessName: string;
  blogger: { id: string; name: string; avatar_url?: string } | null;
}

export function BloggerChatDialog({ open, onOpenChange, businessId, businessName, blogger }: Props) {
  const { t } = useLanguage();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Find or create conversation between this business and blogger.
  // We use a deterministic conversation by storing participant_entity_id = blogger.id with role "influencer"
  // and tag the conversation by encoding business in last_message metadata isn't ideal — instead we look up by both ids via filter.
  useEffect(() => {
    if (!open || !blogger) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Look for existing conversation between this business->blogger
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .eq("participant_entity_id", blogger.id)
        .eq("participant_role", "influencer")
        .ilike("participant_name", `%${blogger.name}%`)
        .limit(1);

      let convId = existing?.[0]?.id ?? null;
      if (!convId) {
        const { data, error } = await supabase
          .from("conversations")
          .insert({
            participant_role: "influencer" as any,
            participant_name: blogger.name,
            participant_entity_id: blogger.id,
          })
          .select()
          .single();
        if (error) { toast.error(error.message); setLoading(false); return; }
        convId = data.id;
      }
      if (cancelled) return;
      setConversationId(convId);
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });
      if (!cancelled) setMessages(msgs || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, blogger]);

  // Realtime subscription for incoming messages
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`biz-chat-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => setMessages(prev => [...prev, payload.new as any]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    if (!text.trim() || !conversationId) return;
    const content = text.trim();
    setText("");
    const { error } = await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      content,
      sender_role: "business" as any,
      sender_name: businessName,
    });
    if (error) { toast.error(error.message); return; }
    await supabase.from("conversations")
      .update({ last_message: content, last_message_at: new Date().toISOString() })
      .eq("id", conversationId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 rounded-2xl max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border/30">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold">
              {blogger?.avatar_url ? <img src={blogger.avatar_url} alt={blogger.name} className="w-full h-full rounded-xl object-cover" /> : blogger?.name?.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold">{blogger?.name}</div>
              <div className="text-[11px] text-muted-foreground font-normal">{t("بلاگر", "Blogger")}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-transparent to-card/20">
          {loading && <p className="text-xs text-muted-foreground text-center">{t("در حال بارگذاری...", "Loading...")}</p>}
          {!loading && messages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">{t("هنوز پیامی رد و بدل نشده", "No messages yet")}</p>
          )}
          {messages.map(m => (
            <div key={m.id} className={cn("flex", m.sender_role === "business" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%] px-3 py-2 text-sm rounded-2xl",
                m.sender_role === "business" ? "bg-primary/15 rounded-tr-md" : "bg-muted/40 rounded-tl-md")}>
                <p className="text-foreground">{m.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-muted-foreground/70">
                    {new Date(m.created_at).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {m.sender_role === "business" && <CheckCheck className="w-3 h-3 text-primary/60" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-border/30 flex items-center gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={t("پیام بنویسید...", "Type a message...")}
            className="flex-1 bg-muted/20 border border-border/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/40"
          />
          <button onClick={send} disabled={!text.trim()} className="p-2.5 rounded-xl gold-gradient text-primary-foreground disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
