import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import {
  LogOut, User, LayoutDashboard, Megaphone, Calendar, MessageSquare,
  Edit, Save, Star, TrendingUp, Users
} from "lucide-react";

const BloggerDashboard = () => {
  const { t, dir } = useLanguage();
  const { session, logout, loading } = useUserAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ bio: "", city: "" });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!session || session.entity_type !== "blogger")) {
      navigate("/login", { replace: true });
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    if (!session) return;
    const fetchData = async () => {
      setLoadingData(true);
      const [profileRes, campaignsRes, meetingsRes, messagesRes] = await Promise.all([
        supabase.from("influencers").select("*").eq("id", session.entity_id).maybeSingle(),
        supabase.from("campaign_influencers").select("*, campaigns(*)").eq("influencer_id", session.entity_id),
        supabase.from("meetings").select("*, businesses(name)").eq("influencer_id", session.entity_id).order("meeting_date", { ascending: true }).limit(5),
        supabase.from("conversations").select("*, chat_messages(content, created_at, sender_role)").eq("participant_entity_id", session.entity_id).order("last_message_at", { ascending: false }).limit(10),
      ]);
      setProfile(profileRes.data);
      setCampaigns(campaignsRes.data || []);
      setMeetings(meetingsRes.data || []);
      setMessages(messagesRes.data || []);
      if (profileRes.data) setEditForm({ bio: profileRes.data.bio || "", city: profileRes.data.city || "" });
      setLoadingData(false);
    };
    fetchData();
  }, [session]);

  const handleSaveProfile = async () => {
    if (!session) return;
    const { error } = await supabase.from("influencers").update({
      bio: editForm.bio || null,
      city: editForm.city || null,
    }).eq("id", session.entity_id);
    if (error) { toast.error(error.message); return; }
    toast.success(t("پروفایل بروزرسانی شد", "Profile updated"));
    setProfile((p: any) => ({ ...p, bio: editForm.bio, city: editForm.city }));
    setEditOpen(false);
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
              {session.avatar_url ? <img src={session.avatar_url} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{session.name}</p>
              <p className="text-xs text-muted-foreground">{t("پنل بلاگر", "Blogger Panel")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} className="text-muted-foreground">
              <Edit className="w-4 h-4 me-1" />{t("ویرایش", "Edit")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/login"); }} className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4 me-2" />{t("خروج", "Logout")}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">{t("داشبورد بلاگر", "Blogger Dashboard")}</h1>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Megaphone, label: t("کمپین‌ها", "Campaigns"), value: campaigns.length, color: "text-primary" },
            { icon: Calendar, label: t("جلسات", "Meetings"), value: meetings.length, color: "text-blue-500" },
            { icon: Users, label: t("فالوور", "Followers"), value: profile?.followers?.toLocaleString() || "0", color: "text-green-500" },
            { icon: Star, label: t("امتیاز تعامل", "Engagement"), value: `${profile?.engagement || 0}%`, color: "text-amber-500" },
          ].map((kpi, i) => (
            <div key={i} className="bg-card/80 border border-border/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Campaigns */}
        <div className="bg-card/80 border border-border/50 rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />{t("کمپین‌های من", "My Campaigns")}
          </h2>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("هنوز کمپینی ندارید", "No campaigns yet")}</p>
          ) : (
            <div className="space-y-3">
              {campaigns.map((ci: any) => (
                <div key={ci.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">{ci.campaigns?.title || "-"}</p>
                    <p className="text-xs text-muted-foreground">{ci.campaigns?.status || "-"}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{ci.campaigns?.budget || "-"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meetings */}
        <div className="bg-card/80 border border-border/50 rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />{t("جلسات پیش‌رو", "Upcoming Meetings")}
          </h2>
          {meetings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("جلسه‌ای ندارید", "No meetings")}</p>
          ) : (
            <div className="space-y-3">
              {meetings.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.businesses?.name || "-"}</p>
                    <p className="text-xs text-muted-foreground">{m.location || "-"}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-sm text-foreground">{m.meeting_date}</p>
                    <p className="text-xs text-muted-foreground">{m.meeting_time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="bg-card/80 border border-border/50 rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />{t("پیام‌ها", "Messages")}
          </h2>
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("پیامی ندارید", "No messages")}</p>
          ) : (
            <div className="space-y-3">
              {messages.map((conv: any) => (
                <div key={conv.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">{conv.participant_name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[250px]">{conv.last_message || "-"}</p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center px-1.5">{conv.unread_count}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("ویرایش پروفایل", "Edit Profile")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("شهر", "City")}</label>
              <input value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("بیوگرافی", "Bio")}</label>
              <textarea value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm resize-none" />
            </div>
            <Button onClick={handleSaveProfile} className="w-full gap-2 rounded-xl">
              <Save className="w-4 h-4" />{t("ذخیره", "Save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BloggerDashboard;
