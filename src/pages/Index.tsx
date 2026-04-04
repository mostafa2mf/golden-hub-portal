import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { KpiCard } from "@/components/admin/KpiCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Users, Building2, Megaphone, CalendarDays, CheckCircle, MessageSquare,
  TrendingUp, Clock, UserPlus, Star, Mail, Calendar, Edit, Building, Eye, Check, X
} from "lucide-react";
import {
  demoInfluencers, demoBusinesses, demoCampaigns, demoMeetings,
  demoActivities, categoryPerformance, registrationChartData, campaignChartData
} from "@/data/demoData";
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
  const [chartRange, setChartRange] = useState("30d");

  const handleApprove = (name: string) => {
    toast.success(t(`${name} تأیید شد`, `${name} approved`));
  };
  const handleReject = (name: string) => {
    toast.error(t(`${name} رد شد`, `${name} rejected`));
  };

  return (
    <AdminLayout title={t("داشبورد", "Dashboard")}>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Users} value="1,248" title={t("کل کاربران", "Total Users")} trend={12} trendLabel={t("نسبت به ماه قبل", "vs last month")} />
        <KpiCard icon={Users} value="892" title={t("اینفلوئنسر فعال", "Active Influencers")} trend={8} />
        <KpiCard icon={Building2} value="156" title={t("کسب‌وکار فعال", "Active Businesses")} trend={15} />
        <KpiCard icon={Megaphone} value="34" title={t("کمپین فعال", "Active Campaigns")} trend={5} />
        <KpiCard icon={CalendarDays} value="18" title={t("جلسات فعال", "Active Meetings")} trend={-3} />
        <KpiCard icon={CheckCircle} value="23" title={t("در انتظار تأیید", "Pending Approvals")} trend={0} />
        <KpiCard icon={MessageSquare} value="47" title={t("پیام خوانده نشده", "Unread Messages")} trend={22} />
        <KpiCard icon={TrendingUp} value="₹12.5M" title={t("عملکرد پلتفرم", "Platform Revenue")} trend={18} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column - Charts */}
        <div className="xl:col-span-2 space-y-6">
          {/* Chart filters */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">{t("نمای فعالیت پلتفرم", "Platform Activity")}</h2>
              <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
                {["7d", "30d", "90d"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${chartRange === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationChartData}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(43, 80%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(43, 80%, 55%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
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
            <h2 className="text-base font-semibold mb-4">{t("صف بررسی", "Pending Review Queue")}</h2>
            <div className="space-y-3">
              {demoInfluencers.filter(i => i.status === "pending").concat(demoBusinesses.filter(b => b.status === "pending") as any).map((item: any, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.category} • {item.city}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="pending" />
                    <button onClick={() => handleApprove(item.name)} className="p-1.5 rounded-lg hover:bg-success/10 text-success transition-colors"><Check className="w-4 h-4" /></button>
                    <button onClick={() => handleReject(item.name)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><X className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold mb-4">{t("عملکرد دسته‌بندی‌ها", "Category Performance")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categoryPerformance.map((cat) => (
                <div key={cat.name} className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="text-sm font-semibold mb-2">{cat.name}</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between"><span>{t("کسب‌وکار", "Businesses")}</span><span className="text-foreground font-medium">{cat.businesses}</span></div>
                    <div className="flex justify-between"><span>{t("اینفلوئنسر", "Influencers")}</span><span className="text-foreground font-medium">{cat.influencers}</span></div>
                    <div className="flex justify-between"><span>{t("کمپین", "Campaigns")}</span><span className="text-foreground font-medium">{cat.campaigns}</span></div>
                    <div className="flex justify-between"><span>{t("تعامل", "Engagement")}</span><span className="text-primary font-medium">{cat.engagement}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Meetings */}
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold mb-4">{t("جلسات امروز", "Today's Meetings")}</h2>
            <div className="space-y-3">
              {demoMeetings.filter(m => m.date === "2026-04-04").map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{m.business} — {m.influencer}</div>
                      <div className="text-xs text-muted-foreground">{m.city} • {m.time} • {m.campaign}</div>
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
              {demoActivities.map((act) => {
                const IconComp = activityIcons[act.icon] || Clock;
                return (
                  <div key={act.id} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 ${activityColors[act.type] || ""}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground leading-relaxed">{act.message}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{act.time}</div>
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
