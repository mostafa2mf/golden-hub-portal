import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { demoMessages } from "@/data/demoData";
import { Search, Pin, Send, Image, Paperclip, MoreVertical, Archive, Flag, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MessagesPage = () => {
  const { t } = useLanguage();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  const selected = demoMessages.find(m => m.id === selectedChat);

  const mockMessages = [
    { id: "1", text: "سلام، وقتتون بخیر", sender: "user", time: "10:15" },
    { id: "2", text: "سلام! چطور میتونم کمکتون کنم؟", sender: "admin", time: "10:16" },
    { id: "3", text: "درباره کمپین جدید سوال داشتم، آیا امکان تغییر زمانبندی وجود داره؟", sender: "user", time: "10:18" },
    { id: "4", text: "بله، لطفاً جزئیات بیشتر بفرمایید تا بررسی کنم", sender: "admin", time: "10:20" },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    toast.success(t("پیام ارسال شد", "Message sent"));
    setMessage("");
  };

  const filteredMessages = demoMessages.filter(m => {
    if (filter === "unread") return m.unread > 0;
    if (filter === "pinned") return m.pinned;
    return true;
  });

  return (
    <AdminLayout title={t("پیام‌ها", "Messages")}>
      <div className="glass-card overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
        <div className="flex h-full">
          {/* Sidebar */}
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
              {filteredMessages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => setSelectedChat(msg.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-border/20",
                    selectedChat === msg.id ? "bg-primary/5" : "hover:bg-muted/30"
                  )}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{msg.name.charAt(0)}</div>
                    {msg.online && <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium truncate">{msg.name}</span>
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-xs text-muted-foreground truncate">{msg.lastMessage}</span>
                      <div className="flex items-center gap-1">
                        {msg.pinned && <Pin className="w-3 h-3 text-primary" />}
                        {msg.unread > 0 && <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{msg.unread}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat panel */}
          <div className={cn("flex-1 flex flex-col", !selectedChat && "hidden md:flex")}>
            {selected ? (
              <>
                <div className="flex items-center justify-between p-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedChat(null)} className="md:hidden p-1.5 rounded-lg hover:bg-muted">←</button>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{selected.name.charAt(0)}</div>
                    <div>
                      <div className="text-sm font-medium">{selected.name}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <span className={cn("w-1.5 h-1.5 rounded-full", selected.online ? "bg-success" : "bg-muted-foreground")} />
                        {selected.online ? t("آنلاین", "Online") : t("آفلاین", "Offline")}
                        <span className="ms-1 px-1.5 py-0.5 rounded bg-muted text-[10px]">{selected.role === "influencer" ? t("اینفلوئنسر", "Influencer") : t("کسب‌وکار", "Business")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toast.success(t("آرشیو شد", "Archived"))} className="p-2 rounded-lg hover:bg-muted transition-colors"><Archive className="w-4 h-4 text-muted-foreground" /></button>
                    <button onClick={() => toast.success(t("پرچم‌گذاری شد", "Flagged"))} className="p-2 rounded-lg hover:bg-muted transition-colors"><Flag className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                  <div className="text-center text-xs text-muted-foreground py-2">{t("امروز", "Today")}</div>
                  {mockMessages.map(msg => (
                    <div key={msg.id} className={cn("flex", msg.sender === "admin" ? "justify-start" : "justify-end")}>
                      <div className={cn(
                        "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                        msg.sender === "admin" ? "bg-muted/50 rounded-tl-sm" : "bg-primary/20 text-foreground rounded-tr-sm"
                      )}>
                        <p>{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                          {msg.sender === "admin" && <CheckCheck className="w-3 h-3 text-primary" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground animate-pulse">{t("در حال تایپ...", "Typing...")}</div>
                </div>

                <div className="p-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors"><Paperclip className="w-4 h-4 text-muted-foreground" /></button>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors"><Image className="w-4 h-4 text-muted-foreground" /></button>
                    <input
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSend()}
                      placeholder={t("پیام بنویسید...", "Type a message...")}
                      className="flex-1 bg-muted/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors"
                    />
                    <button onClick={handleSend} className="p-2.5 rounded-xl gold-gradient text-primary-foreground hover:opacity-90 transition-opacity"><Send className="w-4 h-4" /></button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{t("یک مکالمه را انتخاب کنید", "Select a conversation")}</p>
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

import { MessageSquare } from "lucide-react";
