import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { KpiCard } from "@/components/admin/KpiCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRealtimeInvalidation } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Building2, Megaphone, CalendarDays, CheckCircle, MessageSquare,
  TrendingUp, Clock, UserPlus, Star, Mail, Calendar, Edit, Building, Eye, Check, X
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

const activityIcons: Record<string, any> = {
  "user-plus": UserPlus, check: Check, megaphone: Megaphone,
  star: Star, mail: Mail, calendar: Calendar, edit: Edit, building: Building,
};

const activityColors: Record<string, string> = {
  registration: "text-info", approval: "text-success", campaign: "text-primary",
  review: "text-warning", message: "text-info", meeting: "text-destructive", edit: "text-muted-foreground",
};

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState("30d");

  // Real data queries
  const { data: influencers = [] } = useQuery({
    queryKey: ["influencers"],
    queryFn: async () => {
      const { data } = await supabase.from("influencers").select("*");
      return data || [];
    },
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("*");
      return data || [];
    },
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data } = await supabase.from("campaigns").select("*");
      return data || [];
    },
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data } = await supabase.from("meetings").select("*, businesses(name), influencers(name)");
      return data || [];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activity_log"],
    queryFn: async () => {
      const { data } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data } = await supabase.from("conversations").select("*");
      return data || [];
    },
  });

  // Realtime subscriptions
  useRealtimeInvalidation("influencers", ["influencers"]);
  useRealtimeInvalidation("businesses", ["businesses"]);
  useRealtimeInvalidation("campaigns", ["campaigns"]);
  useRealtimeInvalidation("meetings", ["meetings"]);
  useRealtimeInvalidation("activity_log", ["activity_log"]);
  useRealtimeInvalidation("conversations", ["conversations"]);

  // Computed KPIs
  const activeInfluencers = influencers.filter(i => i.status === "active").length;
  const activeBusinesses = businesses.filter(b => b.status === "active").length;
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const pendingApprovals = influencers.filter(i => i.status === "pending").length + businesses.filter(b => b.status === "pending").length;
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  const todayMeetings = meetings.filter(m => m.meeting_date === new Date().toISOString().split("T")[0]);

  // Pending items for review queue
  const pendingItems = [
    ...influencers.filter(i => i.status === "pending").map(i => ({ ...i, _type: "influencer" })),
    ...businesses.filter(b => b.status === "pending").map(b => ({ ...b, _type: "business" })),
  ];

  const handleApprove = async (item: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.functions.invoke("notify-approval", {
      body: { entity_id: item.id, entity_type: item._type, action: "approve" },
    });
    if (error) toast.error(t("خطا در تأیید", "Error approving"));
    else toast.success(t(`${item.name} تأیید شد`, `${item.name} approved`));
  };

  const handleReject = async (item: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.functions.invoke("notify-approval", {
      body: { entity_id: item.id, entity_type: item._type, action: "reject" },
    });
    if (error) toast.error(t("خطا در رد", "Error rejecting"));
    else toast.error(t(`${item.name} رد شد`, `${item.name} rejected`));
  };

  // Chart data placeholder (from real data when available)
  const registrationChartData = [
    { date: "فروردین", influencers: 45, businesses: 12 },
    { date: "اردیبهشت", influencers: 52, businesses: 18 },
    { date: "خرداد", influencers: 61, businesses: 22 },
    { date: "تیر", influencers: 78, businesses: 28 },
    { date: "مرداد", influencers: 85, businesses: 32 },
    { date: "شهریور", influencers: 92, businesses: 35 },
  ];

  const campaignChartData = [
    { date: "فروردین", active: 8, completed: 3 },
    { date: "اردیبهشت", active: 12, completed: 6 },
    { date: "خرداد", active: 15, completed: 10 },
    { date: "تیر", active: 20, completed: 14 },
    { date: "مرداد", active: 18, completed: 18 },
    { date: "شهریور", active: activeCampaigns || 22, completed: campaigns.filter(c => c.status === "completed").length || 20 },
  ];

  return (
    <AdminLayout title={t("داشبورد", "Dashboard")}>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Users} value={String(influencers.length + businesses.length)} title={t("کل کاربران", "Total Users")} trend={12} trendLabel={t("نسبت به ماه قبل", "vs last month")} onClick={() => navigate("/influencers")} />
        <KpiCard icon={Users} value={String(activeInfluencers)} title={t("اینفلوئنسر فعال", "Active Influencers")} trend={8} onClick={() => navigate("/influencers")} />
        <KpiCard icon={Building2} value={String(activeBusinesses)} title={t("کسب‌وکار فعال", "Active Businesses")} trend={15} onClick={() => navigate("/businesses")} />
        <KpiCard icon={Megaphone} value={String(activeCampaigns)} title={t("کمپین فعال", "Active Campaigns")} trend={5} onClick={() => navigate("/campaigns")} />
        <KpiCard icon={CalendarDays} value={String(todayMeetings.length)} title={t("جلسات امروز", "Today's Meetings")} trend={0} onClick={() => navigate("/meetings")} />
        <KpiCard icon={CheckCircle} value={String(pendingApprovals)} title={t("در انتظار تأیید", "Pending Approvals")} trend={0} onClick={() => navigate("/approvals")} />
        <KpiCard icon={MessageSquare} value={String(unreadMessages)} title={t("پیام خوانده نشده", "Unread Messages")} trend={0} onClick={() => navigate("/messages")} />
        <KpiCard icon={TrendingUp} value={String(campaigns.length)} title={t("کل کمپین‌ها", "Total Campaigns")} trend={0} onClick={() => navigate("/analytics")} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Chart */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">{t("نمای فعالیت پلتفرم", "Platform Activity")}</h2>
              <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
                {["7d", "30d", "90d"].map((r) => (
                  <button key={r} onClick={() => setChartRange(r)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${chartRange === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{r}</button>
                ))}
              </div>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationChartData}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(43, 80%, 55%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(43, 80%, 55%)" stopOpacity={0} /></linearGradient>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 18%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220, 12%, 10%)", border: "1px solid hsl(220, 10%, 18%)", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="influencers" stroke="hsl(43, 80%, 55%)" fill="url(#goldGrad)" strokeWidth={2} name={t("اینفلوئنسرها", "Influencers")} />
                  <Area type="monotone" dataKey="businesses" stroke="hsl(217, 91%, 60%)" fill="url(#blueGrad)" strokeWidth={2} name={t("کسب‌وکارها", "Businesses")} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Campaign chart */}
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold mb-4">{t("فعالیت کمپین‌ها", "Campaign Activity")}</h2>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 18%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220, 12%, 10%)", border: "1px solid hsl(220, 10%, 18%)", borderRadius: 12 }} />
                  <Bar dataKey="active" fill="hsl(43, 80%, 55%)" radius={[4, 4, 0, 0]} name={t("فعال", "Active")} />
                  <Bar dataKey="completed" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name={t("تکمیل‌شده", "Completed")} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Review Queue */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">{t("صف بررسی", "Pending Review Queue")}</h2>
              <button onClick={() => navigate("/approvals")} className="text-xs text-primary hover:underline">{t("مشاهده همه", "View all")}</button>
            </div>
            <div className="space-y-3">
              {pendingItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t("موردی برای بررسی نیست", "No items pending review")}</p>
              )}
              {pendingItems.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{item.name.charAt(0)}</div>
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item._type === "influencer" ? t("اینفلوئنسر", "Influencer") : t("کسب‌وکار", "Business")} • {item.city || "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="pending" />
                    <button onClick={() => handleApprove(item)} className="p-1.5 rounded-lg hover:bg-success/10 text-success transition-colors"><Check className="w-4 h-4" /></button>
                    <button onClick={() => handleReject(item)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><X className="w-4 h-4" /></button>
                    <button onClick={() => navigate("/approvals")} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Meetings */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">{t("جلسات امروز", "Today's Meetings")}</h2>
              <button onClick={() => navigate("/meetings")} className="text-xs text-primary hover:underline">{t("مشاهده همه", "View all")}</button>
            </div>
            <div className="space-y-3">
              {todayMeetings.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t("جلسه‌ای برای امروز نیست", "No meetings today")}</p>
              )}
              {todayMeetings.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate("/meetings")}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center"><Clock className="w-5 h-5 text-info" /></div>
                    <div>
                      <div className="text-sm font-medium">{m.businesses?.name || "-"} — {m.influencers?.name || "-"}</div>
                      <div className="text-xs text-muted-foreground">{m.city} • {m.meeting_time}</div>
                    </div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Activity Feed */}
        <div className="space-y-6">
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold mb-4">{t("فعالیت‌های اخیر", "Recent Activity")}</h2>
            <div className="space-y-4">
              {activities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t("فعالیتی ثبت نشده", "No activities yet")}</p>
              )}
              {activities.map((act) => {
                const IconComp = activityIcons[act.icon || ""] || Clock;
                return (
                  <div key={act.id} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 ${activityColors[act.type] || ""}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground leading-relaxed">{act.message_fa || act.message}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(act.created_at).toLocaleString("fa-IR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Index;
