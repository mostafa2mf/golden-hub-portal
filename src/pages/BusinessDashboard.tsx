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
  LogOut, Building2, LayoutDashboard, Megaphone, Calendar, MessageSquare,
  Edit, Save, Star, TrendingUp, Plus, MessageCircle
} from "lucide-react";
import { CampaignFormModal } from "@/components/admin/CampaignFormModal";
import { BloggerChatDialog } from "@/components/business/BloggerChatDialog";

const BusinessDashboard = () => {
  const { t, dir } = useLanguage();
  const { session, logout, loading } = useUserAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ description: "", city: "", phone: "", email: "" });
  const [loadingData, setLoadingData] = useState(true);
  const [addCampaignOpen, setAddCampaignOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [chatBlogger, setChatBlogger] = useState<{ id: string; name: string; avatar_url?: string } | null>(null);
  const [pickerCampaign, setPickerCampaign] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && (!session || session.entity_type !== "business")) {
      navigate("/login", { replace: true });
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    if (!session) return;
    const fetchData = async () => {
      setLoadingData(true);
      const [profileRes, campaignsRes, meetingsRes, messagesRes] = await Promise.all([
        supabase.from("businesses").select("*").eq("id", session.entity_id).maybeSingle(),
        supabase.from("campaigns").select("*, campaign_influencers(id, status, influencers(id, name, avatar_url))").eq("business_id", session.entity_id).order("created_at", { ascending: false }),
        supabase.from("meetings").select("*, influencers(name)").eq("business_id", session.entity_id).order("meeting_date", { ascending: true }).limit(5),
        supabase.from("conversations").select("*, chat_messages(content, created_at, sender_role)").eq("participant_entity_id", session.entity_id).order("last_message_at", { ascending: false }).limit(10),
      ]);
      setProfile(profileRes.data);
      // Only active campaigns shown in dashboard list
      const activeCampaigns = (campaignsRes.data || []).filter((c: any) => c.status === "active");
      setCampaigns(activeCampaigns);
      setMeetings(meetingsRes.data || []);
      setMessages(messagesRes.data || []);
      if (profileRes.data) setEditForm({
        description: profileRes.data.description || "",
        city: profileRes.data.city || "",
        phone: profileRes.data.phone || "",
        email: profileRes.data.email || "",
      });
      setLoadingData(false);
    };
    fetchData();
  }, [session, refreshTick]);

  const handleSaveProfile = async () => {
    if (!session) return;
    const { error } = await supabase.from("businesses").update({
      description: editForm.description || null,
      city: editForm.city || null,
      phone: editForm.phone || null,
      email: editForm.email || null,
    }).eq("id", session.entity_id);
    if (error) { toast.error(error.message); return; }
    toast.success(t("پروفایل بروزرسانی شد", "Profile updated"));
    setProfile((p: any) => ({ ...p, ...editForm }));
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
              {session.avatar_url ? <img src={session.avatar_url} className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{session.name}</p>
              <p className="text-xs text-muted-foreground">{t("پنل کسب‌وکار", "Business Panel")}</p>
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
          <h1 className="text-xl font-bold text-foreground">{t("داشبورد کسب‌وکار", "Business Dashboard")}</h1>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Megaphone, label: t("کمپین‌ها", "Campaigns"), value: campaigns.length, color: "text-primary" },
            { icon: Calendar, label: t("جلسات", "Meetings"), value: meetings.length, color: "text-blue-500" },
            { icon: TrendingUp, label: t("همکاری‌ها", "Collabs"), value: profile?.completed_collabs || 0, color: "text-green-500" },
            { icon: Star, label: t("امتیاز", "Rating"), value: profile?.rating || "-", color: "text-amber-500" },
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />{t("کمپین‌های من", "My Campaigns")}
            </h2>
            <Button size="sm" onClick={() => setAddCampaignOpen(true)} className="gap-1.5 rounded-xl gold-gradient text-primary-foreground border-0">
              <Plus className="w-4 h-4" />{t("افزودن کمپین", "Add Campaign")}
            </Button>
          </div>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("هنوز کمپینی ندارید", "No campaigns yet")}</p>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c: any) => {
                const acceptedBloggers = (c.campaign_influencers || [])
                  .filter((ci: any) => ci.status === "accepted" && ci.influencers)
                  .map((ci: any) => ci.influencers);
                return (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    {c.images?.[0] && (
                      <img src={c.images[0]} alt={c.title} className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.city || "-"}{c.address ? ` • ${c.address}` : ""}</p>
                    </div>
                    {acceptedBloggers.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 rounded-xl border-primary/40 text-primary hover:bg-primary/10"
                        onClick={() => {
                          if (acceptedBloggers.length === 1) setChatBlogger(acceptedBloggers[0]);
                          else setPickerCampaign({ ...c, _bloggers: acceptedBloggers });
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />{t("شروع چت", "Chat")}
                      </Button>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{t("فعال", "Active")}</span>
                  </div>
                );
              })}
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
                    <p className="text-sm font-medium text-foreground">{m.influencers?.name || "-"}</p>
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
              <label className="text-sm text-muted-foreground mb-1 block">{t("تلفن", "Phone")}</label>
              <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("ایمیل", "Email")}</label>
              <input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t("توضیحات", "Description")}</label>
              <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm resize-none" />
            </div>
            <Button onClick={handleSaveProfile} className="w-full gap-2 rounded-xl">
              <Save className="w-4 h-4" />{t("ذخیره", "Save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CampaignFormModal
        open={addCampaignOpen}
        onOpenChange={setAddCampaignOpen}
        mode="business"
        businessId={session.entity_id}
        onCreated={() => setRefreshTick(t => t + 1)}
      />
    </div>
  );
};

export default BusinessDashboard;
