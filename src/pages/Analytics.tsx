import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { registrationChartData, campaignChartData, categoryPerformance } from "@/data/demoData";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const COLORS = ["hsl(43, 80%, 55%)", "hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)", "hsl(0, 72%, 51%)", "hsl(38, 92%, 50%)", "hsl(280, 60%, 50%)", "hsl(180, 60%, 45%)", "hsl(330, 70%, 55%)"];

const pieData = categoryPerformance.map(c => ({ name: c.name, value: c.campaigns }));

const cityData = [
  { city: "تهران", users: 520 }, { city: "اصفهان", users: 180 }, { city: "شیراز", users: 140 },
  { city: "مشهد", users: 120 }, { city: "تبریز", users: 95 }, { city: "کرج", users: 85 },
];

const AnalyticsPage = () => {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState("30d");

  return (
    <AdminLayout title={t("تحلیل‌ها", "Analytics")}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-1 bg-muted/50 rounded-xl p-0.5">
          {["7d", "30d", "90d"].map(r => (
            <button key={r} onClick={() => setDateRange(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dateRange === r ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{r}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={() => toast.success("CSV exported")}><Download className="w-3.5 h-3.5" />CSV</Button>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={() => toast.success("PDF exported")}><FileText className="w-3.5 h-3.5" />PDF</Button>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={() => toast.success("Printing...")}><Printer className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("رشد کاربران", "User Growth")}</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationChartData}>
                <defs>
                  <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(43, 80%, 55%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(43, 80%, 55%)" stopOpacity={0} /></linearGradient>
                  <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 18%)" />
                <XAxis dataKey="date" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(220, 12%, 10%)", border: "1px solid hsl(220, 10%, 18%)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="influencers" stroke="hsl(43, 80%, 55%)" fill="url(#ag1)" strokeWidth={2} />
                <Area type="monotone" dataKey="businesses" stroke="hsl(217, 91%, 60%)" fill="url(#ag2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Activity */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("فعالیت کمپین", "Campaign Activity")}</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 18%)" />
                <XAxis dataKey="date" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(220, 12%, 10%)", border: "1px solid hsl(220, 10%, 18%)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="active" fill="hsl(43, 80%, 55%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("توزیع دسته‌بندی", "Category Distribution")}</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(220, 12%, 10%)", border: "1px solid hsl(220, 10%, 18%)", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Active Cities */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("فعال‌ترین شهرها", "Most Active Cities")}</h3>
          <div className="space-y-3">
            {cityData.map((c, i) => (
              <div key={c.city}>
                <div className="flex justify-between text-sm mb-1"><span>{c.city}</span><span className="font-medium">{c.users}</span></div>
                <div className="h-2 bg-muted/50 rounded-full"><div className="h-full rounded-full" style={{ width: `${(c.users / 520) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Influencers */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("برترین اینفلوئنسرها", "Top Influencers")}</h3>
          <div className="space-y-3">
            {[{ name: "نازنین موسوی", handle: "@nazanin.m", score: 95 }, { name: "سارا احمدی", handle: "@sara.ahmadi", score: 88 }, { name: "فاطمه نوری", handle: "@fatemeh.noori", score: 82 }, { name: "رضا کریمی", handle: "@reza.karimi", score: 78 }].map((inf, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs font-bold text-primary">{i + 1}</span>
                  <div><div className="text-sm font-medium">{inf.name}</div><div className="text-xs text-muted-foreground">{inf.handle}</div></div>
                </div>
                <span className="text-sm font-bold text-primary">{inf.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">{t("شاخص‌های کلیدی", "Key Metrics")}</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t("نرخ تبدیل کمپین", "Campaign Conversion"), value: "68%", color: "text-success" },
              { label: t("نرخ تکمیل جلسه", "Meeting Completion"), value: "82%", color: "text-info" },
              { label: t("نرخ تأیید ریویو", "Review Approval Rate"), value: "91%", color: "text-primary" },
              { label: t("تعامل پلتفرم", "Platform Engagement"), value: "4.5/5", color: "text-warning" },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
                <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
