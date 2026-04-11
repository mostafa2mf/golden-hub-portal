import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Eye, EyeOff, Copy, Search, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type EntityFilter = "blogger" | "business";

const Credentials = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<EntityFilter>("blogger");
  const [search, setSearch] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  const { data: credentials, isLoading } = useQuery({
    queryKey: ["user-credentials", filter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_credentials")
        .select("*")
        .eq("entity_type", filter)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch entity names for display
  const entityIds = credentials?.map((c) => c.entity_id) ?? [];
  const { data: bloggers } = useQuery({
    queryKey: ["blogger-names", entityIds],
    queryFn: async () => {
      if (!entityIds.length || filter !== "blogger") return [];
      const { data } = await supabase
        .from("influencers")
        .select("id, name, handle, avatar_url")
        .in("id", entityIds);
      return data ?? [];
    },
    enabled: filter === "blogger" && entityIds.length > 0,
  });

  const { data: businesses } = useQuery({
    queryKey: ["business-names", entityIds],
    queryFn: async () => {
      if (!entityIds.length || filter !== "business") return [];
      const { data } = await supabase
        .from("businesses")
        .select("id, name, logo_url")
        .in("id", entityIds);
      return data ?? [];
    },
    enabled: filter === "business" && entityIds.length > 0,
  });

  const getEntityName = (entityId: string) => {
    if (filter === "blogger") {
      const b = bloggers?.find((x) => x.id === entityId);
      return b?.name ?? entityId.slice(0, 8);
    }
    const b = businesses?.find((x) => x.id === entityId);
    return b?.name ?? entityId.slice(0, 8);
  };

  const getEntitySub = (entityId: string) => {
    if (filter === "blogger") {
      const b = bloggers?.find((x) => x.id === entityId);
      return b?.handle ? `@${b.handle}` : "";
    }
    return "";
  };

  const togglePassword = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t(`${label} کپی شد`, `${label} copied`));
  };

  const filtered = credentials?.filter((c) => {
    if (!search.trim()) return true;
    const name = getEntityName(c.entity_id).toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AdminLayout title={t("نام کاربری و رمزها", "Usernames & Passwords")}>
      <div className="space-y-6">
        {/* Switcher + Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Entity type switcher */}
          <div className="flex rounded-xl bg-muted/50 border border-border/50 p-1">
            <button
              onClick={() => setFilter("blogger")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filter === "blogger"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="w-4 h-4" />
              {t("بلاگرها", "Bloggers")}
            </button>
            <button
              onClick={() => setFilter("business")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filter === "business"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Building2 className="w-4 h-4" />
              {t("کسب‌وکارها", "Businesses")}
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder={t("جستجوی نام یا یوزرنیم...", "Search name or username...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-xl ps-10 pe-4 py-2.5 text-sm outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
              dir="ltr"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-start px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("نام", "Name")}
                  </th>
                  <th className="text-start px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("نام کاربری", "Username")}
                  </th>
                  <th className="text-start px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("رمز عبور", "Password")}
                  </th>
                  <th className="text-start px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("کلمه کلیدی", "Keyword")}
                  </th>
                  <th className="text-start px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("عملیات", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/10">
                      <td className="px-5 py-4"><div className="h-4 w-32 bg-muted/50 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-24 bg-muted/50 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-20 bg-muted/50 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-20 bg-muted/50 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-16 bg-muted/50 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : filtered && filtered.length > 0 ? (
                  filtered.map((cred) => (
                    <tr key={cred.id} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{getEntityName(cred.entity_id)}</p>
                          {getEntitySub(cred.entity_id) && (
                            <p className="text-xs text-muted-foreground">{getEntitySub(cred.entity_id)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-mono text-foreground">{cred.username}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-foreground">
                            {visiblePasswords.has(cred.id) ? cred.password : "••••••••"}
                          </span>
                          <button
                            onClick={() => togglePassword(cred.id)}
                            className="p-1 rounded-lg hover:bg-muted transition-colors"
                          >
                            {visiblePasswords.has(cred.id) ? (
                              <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-foreground">{cred.keyword || <span className="text-muted-foreground">—</span>}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyToClipboard(cred.username, t("یوزرنیم", "Username"))}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            title={t("کپی یوزرنیم", "Copy username")}
                          >
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(cred.password, t("رمز عبور", "Password"))}
                            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                            title={t("کپی رمز عبور", "Copy password")}
                          >
                            <Copy className="w-3.5 h-3.5 text-primary" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        {t("هنوز اطلاعاتی ثبت نشده", "No credentials found")}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Credentials;
