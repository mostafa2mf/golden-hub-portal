import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealtimeInvalidation } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { Search, Pin, Send, Image, Paperclip, Archive, Flag, CheckCheck, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MessagesPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data } = await supabase.from("conversations").select("*").order("last_message_at", { ascending: false });
      return data || [];
    },
  });

  const { data: chatMessages = [] } = useQuery({
    queryKey: ["chat_messages", selectedChat],
    queryFn: async () => {
      if (!selectedChat) return [];
      const { data } = await supabase.from("chat_messages").select("*").eq("conversation_id", selectedChat).order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!selectedChat,
  });

  useRealtimeInvalidation("conversations", ["conversations"]);

  const selected = conversations.find((c: any) => c.id === selectedChat);

  const handleSend = async () => {
    if (!message.trim() || !selectedChat) return;
    await supabase.from("chat_messages").insert({ conversation_id: selectedChat, content: message, sender_role: "admin" as any, sender_name: "Admin" });
    await supabase.from("conversations").update({ last_message: message, last_message_at: new Date().toISOString() }).eq("id", selectedChat);
    queryClient.invalidateQueries({ queryKey: ["chat_messages", selectedChat] });
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    setMessage("");
  };

  const filteredConversations = conversations.filter((m: any) => {
    if (filter === "unread") return m.unread_count > 0;
    if (filter === "pinned") return m.is_pinned;
    return true;
  });

  return (
    <AdminLayout title={t("پیام‌ها", "Messages")}>
      <div className="glass-card overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
        <div className="flex h-full">
          <div className={cn("w-full md:w-80 border-e border-border/50 flex flex-col", selectedChat && "hidden md:flex")}>
            <div className="p-3 border-b border-border/50 space-y-2">
              <div className="flex items-center bg-muted/50 rounded-xl border border-border/50">
                <Search className="w-4 h-4 text-muted-foreground mx-3" />
                <input placeholder={t("جستجو...", "Search...")} className="bg-transparent border-none outline-none text-sm py-2 pe-3 w-full" />
              </div>
              <div className="flex gap-1">
                {["all", "unread", "pinned"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {t({ all: "همه", unread: "خوانده نشده", pinned: "سنجاق شده" }[f]!, { all: "All", unread: "Unread", pinned: "Pinned" }[f]!)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {filteredConversations.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t("مکالمه‌ای یافت نشد", "No conversations")}</p>}
              {filteredConversations.map((msg: any) => (
                <div key={msg.id} onClick={() => setSelectedChat(msg.id)} className={cn("flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-border/20", selectedChat === msg.id ? "bg-primary/5" : "hover:bg-muted/30")}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{msg.participant_name.charAt(0)}</div>
                    {msg.is_online && <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center"><span className="text-sm font-medium truncate">{msg.participant_name}</span><span className="text-[10px] text-muted-foreground">{msg.last_message_at ? new Date(msg.last_message_at).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }) : ""}</span></div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-xs text-muted-foreground truncate">{msg.last_message || "-"}</span>
                      <div className="flex items-center gap-1">{msg.is_pinned && <Pin className="w-3 h-3 text-primary" />}{msg.unread_count > 0 && <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{msg.unread_count}</span>}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cn("flex-1 flex flex-col", !selectedChat && "hidden md:flex")}>
            {selected ? (
              <>
                <div className="flex items-center justify-between p-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedChat(null)} className="md:hidden p-1.5 rounded-lg hover:bg-muted">←</button>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{selected.participant_name.charAt(0)}</div>
                    <div>
                      <div className="text-sm font-medium">{selected.participant_name}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <span className={cn("w-1.5 h-1.5 rounded-full", selected.is_online ? "bg-success" : "bg-muted-foreground")} />
                        {selected.is_online ? t("آنلاین", "Online") : t("آفلاین", "Offline")}
                        <span className="ms-1 px-1.5 py-0.5 rounded bg-muted text-[10px]">{selected.participant_role === "influencer" ? t("اینفلوئنسر", "Influencer") : t("کسب‌وکار", "Business")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toast.success(t("آرشیو شد", "Archived"))} className="p-2 rounded-lg hover:bg-muted transition-colors"><Archive className="w-4 h-4 text-muted-foreground" /></button>
                    <button onClick={() => toast.success(t("پرچم‌گذاری شد", "Flagged"))} className="p-2 rounded-lg hover:bg-muted transition-colors"><Flag className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                  <div className="text-center text-xs text-muted-foreground py-2">{t("شروع مکالمه", "Conversation start")}</div>
                  {chatMessages.map((msg: any) => (
                    <div key={msg.id} className={cn("flex", msg.sender_role === "admin" ? "justify-start" : "justify-end")}>
                      <div className={cn("max-w-[75%] px-4 py-2.5 rounded-2xl text-sm", msg.sender_role === "admin" ? "bg-muted/50 rounded-tl-sm" : "bg-primary/20 text-foreground rounded-tr-sm")}>
                        <p>{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1"><span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</span>{msg.sender_role === "admin" && <CheckCheck className="w-3 h-3 text-primary" />}</div>
                      </div>
                    </div>
                  ))}
                  {chatMessages.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t("پیامی وجود ندارد", "No messages yet")}</p>}
                </div>
                <div className="p-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors"><Paperclip className="w-4 h-4 text-muted-foreground" /></button>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors"><Image className="w-4 h-4 text-muted-foreground" /></button>
                    <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder={t("پیام بنویسید...", "Type a message...")} className="flex-1 bg-muted/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors" />
                    <button onClick={handleSend} className="p-2.5 rounded-xl gold-gradient text-primary-foreground hover:opacity-90 transition-opacity"><Send className="w-4 h-4" /></button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center"><MessageSquare className="w-16 h-16 mx-auto mb-3 opacity-30" /><p className="text-sm">{t("یک مکالمه را انتخاب کنید", "Select a conversation")}</p></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MessagesPage;
