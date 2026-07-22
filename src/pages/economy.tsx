import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Wallet, Search, Coins, TrendingUp, ArrowUpRight, Crown, Medal, Award } from "lucide-react";
import { PageTransition, Stagger, GlowCard, ProgressRing } from "@/components/page-transitions";

type EconomyEntry = { userId: string; balance: number; username?: string; avatar?: string };

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const balanceSchema = z.object({ userId: z.string().min(1), balance: z.coerce.number().min(0) });
type BalanceFormValues = z.infer<typeof balanceSchema>;

const rankIcons = [Crown, Medal, Award];
const rankColors = ["text-amber", "text-[#C0C0C0]", "text-amber/60"];
const rankBgs = ["bg-amber/15", "bg-[#C0C0C0]/10", "bg-amber/5"];

export default function Economy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const { data: entries, isLoading } = useQuery({ queryKey: ["economy"], queryFn: () => apiCall<EconomyEntry[]>("/api/bot/economy") });

  const setBalance = useMutation({
    mutationFn: (data: BalanceFormValues) => apiCall("/api/bot/economy", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: t("economySet") });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["economy"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const form = useForm<BalanceFormValues>({ resolver: zodResolver(balanceSchema), defaultValues: { userId: "", balance: 0 } });
  const sorted = entries ? [...entries].sort((a, b) => b.balance - a.balance) : [];
  const filtered = sorted.filter((e) => (e.username || e.userId).toLowerCase().includes(search.toLowerCase()) || e.userId.includes(search));
  const totalBalance = sorted.reduce((sum, e) => sum + e.balance, 0);
  const maxBalance = sorted.length > 0 ? sorted[0].balance : 1;

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber/[0.04] via-transparent to-cyan/[0.03] pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber/[0.06] rounded-full blur-[80px] animate-float" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-amber" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gradient-amber">{t("economyTitle")}</h2>
                <p className="text-muted-foreground/40 text-sm mt-0.5">{t("economyDesc")}</p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 mb-2">{t("economyTotal")}</p>
              {isLoading ? (
                <Skeleton className="h-16 w-64 mx-auto" />
              ) : (
                <span className="text-6xl md:text-7xl font-black font-mono text-gradient-amber animate-fade-in">
                  {totalBalance.toLocaleString()}
                </span>
              )}
              <p className="text-xs text-muted-foreground/30 mt-3">{t("economyTotalBalances", { count: sorted.length.toString() })}</p>
            </div>
          </div>
        </div>
      </PageTransition>

      <Stagger className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PageTransition delay={100}>
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber" />
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/40">{t("economyTotal")}</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                  <Input
                    placeholder={t("economySearch")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-56 h-8 text-xs bg-white/[0.03] border-white/[0.06]"
                  />
                </div>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-4">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                        <div className="ml-auto"><Skeleton className="h-4 w-16" /></div>
                      </div>
                    ))
                  : filtered.length > 0
                  ? filtered.map((entry, idx) => {
                      const RankIcon = rankIcons[idx] || null;
                      const pct = maxBalance > 0 ? (entry.balance / maxBalance) * 100 : 0;
                      return (
                        <div key={entry.userId} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-all group cursor-default">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
                            idx < 3 ? `${rankBgs[idx]} ${rankColors[idx]}` : "bg-white/[0.03] text-muted-foreground/30"
                          }`}>
                            {RankIcon ? <RankIcon className="w-4 h-4" /> : idx + 1}
                          </div>
                          <Avatar className="w-9 h-9 border-2 border-white/[0.06]">
                            <AvatarImage src={entry.avatar || undefined} />
                            <AvatarFallback className="text-[10px] bg-white/[0.05]">{(entry.username || entry.userId).substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate group-hover:text-foreground transition-colors">{entry.username || "Unknown"}</p>
                            <p className="text-[10px] text-muted-foreground/30 font-mono">{entry.userId}</p>
                          </div>
                          <div className="flex-1 hidden md:block">
                            <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-amber/60 to-amber transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-amber text-sm">{entry.balance.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })
                  : (
                    <div className="py-16 text-center text-muted-foreground/30">
                      <Wallet className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">{t("economyNoData")}</p>
                    </div>
                  )}
              </div>
            </div>
          </PageTransition>
        </div>

        <div className="lg:col-span-2">
          <PageTransition delay={200}>
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 glow-cyan">
              <div className="flex items-center gap-2 mb-5">
                <ArrowUpRight className="w-4 h-4 text-cyan-bright" />
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/40">{t("economySetBalance")}</span>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((v) => setBalance.mutate(v))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] text-muted-foreground/40 uppercase tracking-wider font-bold">{t("economyUserId")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("economyUserId")} {...field} className="font-mono bg-white/[0.03] border-white/[0.06]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] text-muted-foreground/40 uppercase tracking-wider font-bold">{t("economyBalance")}</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} className="font-mono bg-white/[0.03] border-white/[0.06]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={setBalance.isPending}
                    className="w-full bg-cyan/15 hover:bg-cyan/20 text-cyan border border-cyan/20 font-bold text-xs uppercase tracking-wider"
                  >
                    {setBalance.isPending ? t("saving") : t("economySet")}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 p-4 rounded-2xl border border-white/[0.04] bg-white/[0.015]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/30">Network Stats</span>
                  <ProgressRing value={sorted.length} max={Math.max(sorted.length, 10)} size={40} strokeWidth={3} color="#FFB800" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-2xl font-black font-mono text-amber">{sorted.length}</p>
                    <p className="text-[10px] text-muted-foreground/30">{t("economyTotalBalances", { count: "" }).replace(/\s*\d+\s*$/, "").trim() || "Accounts"}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black font-mono text-cyan-bright">
                      {sorted.length > 0 ? Math.round(totalBalance / sorted.length).toLocaleString() : 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground/30">Average</p>
                  </div>
                </div>
              </div>
            </div>
          </PageTransition>
        </div>
      </Stagger>
    </div>
  );
}
