import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealtimeInvalidation } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { Search, Pin, Send, Image, Paperclip, Archive, Flag, CheckCheck, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const MessagesPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [showInfluencers, setShowInfluencers] = useState(true);
  const [showBusinesses, setShowBusinesses] = useState(true);

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
    // Role filter
    if (!showInfluencers && m.participant_role === "influencer") return false;
    if (!showBusinesses && m.participant_role === "business") return false;
    return true;
  });

  return (
    <AdminLayout title={t("پیام‌ها", "Messages")}>
      <div className="bg-card/60 backdrop-blur-xl border border-border/30 rounded-2xl overflow-hidden shadow-lg" style={{ height: "calc(100vh - 140px)" }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={cn("w-full md:w-96 border-e border-border/30 flex flex-col bg-card/40", selectedChat && "hidden md:flex")}>
            <div className="p-4 border-b border-border/30 space-y-3">
              <div className="flex items-center bg-muted/30 rounded-xl border border-border/30">
                <Search className="w-4 h-4 text-muted-foreground mx-3" />
                <input placeholder={t("جستجو...", "Search...")} className="bg-transparent border-none outline-none text-sm py-2.5 pe-3 w-full text-foreground placeholder:text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {["all", "unread", "pinned"].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === f ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
                      {t({ all: "همه", unread: "خوانده نشده", pinned: "سنجاق شده" }[f]!, { all: "All", unread: "Unread", pinned: "Pinned" }[f]!)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Role switchers */}
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={showInfluencers} onCheckedChange={setShowInfluencers} className="scale-75" />
                  <span className={showInfluencers ? "text-foreground" : "text-muted-foreground"}>{t("بلاگرها", "Bloggers")}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={showBusinesses} onCheckedChange={setShowBusinesses} className="scale-75" />
                  <span className={showBusinesses ? "text-foreground" : "text-muted-foreground"}>{t("کسب‌وکارها", "Businesses")}</span>
                </label>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {filteredConversations.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t("مکالمه‌ای یافت نشد", "No conversations")}</p>}
              {filteredConversations.map((msg: any) => (
                <div key={msg.id} onClick={() => setSelectedChat(msg.id)} className={cn("flex items-center gap-3 p-4 cursor-pointer transition-all border-b border-border/10", selectedChat === msg.id ? "bg-primary/5 border-s-2 border-s-primary" : "hover:bg-muted/20")}>
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm shadow-md">{msg.participant_name.charAt(0)}</div>
                    {msg.is_online && <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold truncate text-foreground">{msg.participant_name}</span>
                      <span className="text-[10px] text-muted-foreground">{msg.last_message_at ? new Date(msg.last_message_at).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-muted-foreground truncate">{msg.last_message || "-"}</span>
                      <div className="flex items-center gap-1">
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium", msg.participant_role === "influencer" ? "bg-primary/10 text-primary" : "bg-info/10 text-info")}>
                          {msg.participant_role === "influencer" ? t("بلاگر", "Blogger") : t("بیزینس", "Biz")}
                        </span>
                        {msg.is_pinned && <Pin className="w-3 h-3 text-primary" />}
                        {msg.unread_count > 0 && <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold min-w-[20px] text-center">{msg.unread_count}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className={cn("flex-1 flex flex-col", !selectedChat && "hidden md:flex")}>
            {selected ? (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between p-4 border-b border-border/30 bg-card/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 rounded-xl hover:bg-muted/30 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold shadow-md">{selected.participant_name.charAt(0)}</div>
                    <div>
                      <div className="text-sm font-bold text-foreground">{selected.participant_name}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", selected.is_online ? "bg-success" : "bg-muted-foreground/50")} />
                        {selected.is_online ? t("آنلاین", "Online") : t("آفلاین", "Offline")}
                        <span className={cn("ms-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium", selected.participant_role === "influencer" ? "bg-primary/10 text-primary" : "bg-info/10 text-info")}>
                          {selected.participant_role === "influencer" ? t("بلاگر", "Blogger") : t("کسب‌وکار", "Business")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toast.success(t("آرشیو شد", "Archived"))} className="p-2.5 rounded-xl hover:bg-muted/30 transition-colors"><Archive className="w-4 h-4 text-muted-foreground" /></button>
                    <button onClick={() => toast.success(t("پرچم‌گذاری شد", "Flagged"))} className="p-2.5 rounded-xl hover:bg-muted/30 transition-colors"><Flag className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin bg-gradient-to-b from-transparent to-card/20">
                  <div className="text-center"><span className="text-xs text-muted-foreground/60 bg-muted/20 px-3 py-1 rounded-full">{t("شروع مکالمه", "Conversation start")}</span></div>
                  {chatMessages.map((msg: any) => (
                    <div key={msg.id} className={cn("flex", msg.sender_role === "admin" ? "justify-start" : "justify-end")}>
                      <div className={cn("max-w-[70%] px-4 py-3 text-sm leading-relaxed shadow-sm", msg.sender_role === "admin" ? "bg-muted/40 backdrop-blur-sm rounded-2xl rounded-tl-md border border-border/10" : "bg-primary/15 backdrop-blur-sm rounded-2xl rounded-tr-md border border-primary/10")}>
                        <p className="text-foreground">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-1.5">
                          <span className="text-[10px] text-muted-foreground/70">{new Date(msg.created_at).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</span>
                          {msg.sender_role === "admin" && <CheckCheck className="w-3.5 h-3.5 text-primary/60" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  {chatMessages.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t("پیامی وجود ندارد", "No messages yet")}</p>}
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-border/30 bg-card/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl hover:bg-muted/30 transition-colors"><Paperclip className="w-4 h-4 text-muted-foreground" /></button>
                    <button className="p-2.5 rounded-xl hover:bg-muted/30 transition-colors"><Image className="w-4 h-4 text-muted-foreground" /></button>
                    <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder={t("پیام بنویسید...", "Type a message...")} className="flex-1 bg-muted/20 border border-border/30 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/40 focus:bg-muted/30 transition-all text-foreground placeholder:text-muted-foreground" />
                    <button onClick={handleSend} disabled={!message.trim()} className="p-3 rounded-xl gold-gradient text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40 shadow-md"><Send className="w-4 h-4" /></button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-muted/20 mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{t("یک مکالمه را انتخاب کنید", "Select a conversation")}</h3>
                  <p className="text-sm text-muted-foreground">{t("برای شروع چت یک مکالمه را از سمت راست انتخاب کنید", "Pick a conversation from the list to start chatting")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MessagesPage;
