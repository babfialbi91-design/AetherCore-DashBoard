import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Wallet, Search, Coins, TrendingUp } from "lucide-react";
import { PageTransition, Stagger, GlowCard } from "@/components/page-transitions";

type EconomyEntry = { userId: string; balance: number; username?: string; avatar?: string };

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const balanceSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  balance: z.coerce.number().min(0, "Balance must be at least 0"),
});

type BalanceFormValues = z.infer<typeof balanceSchema>;

export default function Economy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const { data: entries, isLoading } = useQuery({
    queryKey: ["economy"],
    queryFn: () => apiCall<EconomyEntry[]>("/api/bot/economy"),
  });

  const setBalance = useMutation({
    mutationFn: (data: BalanceFormValues) =>
      apiCall("/api/bot/economy", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({ title: t("economySet") });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["economy"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const form = useForm<BalanceFormValues>({
    resolver: zodResolver(balanceSchema),
    defaultValues: { userId: "", balance: 0 },
  });

  const sorted = entries
    ? [...entries].sort((a, b) => b.balance - a.balance)
    : [];

  const filtered = sorted.filter((e) =>
    (e.username || e.userId).toLowerCase().includes(search.toLowerCase()) ||
    e.userId.includes(search)
  );

  const totalBalance = sorted.reduce((sum, e) => sum + e.balance, 0);

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent flex items-center gap-3">
            <Wallet className="w-8 h-8 text-primary" />
            {t("economyTitle")}
          </h2>
          <p className="text-muted-foreground mt-2">{t("economyDesc")}</p>
        </div>
      </PageTransition>

      <Stagger className="grid gap-4 md:grid-cols-2">
        <GlowCard color="primary">
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("economyTotal")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-40" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Coins className="w-6 h-6 text-primary" /></div>
                  <div>
                    <span className="text-3xl font-bold font-mono text-primary">{totalBalance.toLocaleString()}</span>
                    <p className="text-xs text-muted-foreground mt-1">{t("economyTotalBalances", { count: sorted.length })}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </GlowCard>

        <GlowCard color="blue">
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("economySetBalance")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => setBalance.mutate(values))} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="userId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("economyUserId")}</FormLabel>
                        <FormControl><Input placeholder={t("economyUserId")} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="balance" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("economyBalance")}</FormLabel>
                        <FormControl><Input type="number" min={0} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <Button type="submit" disabled={setBalance.isPending} className="w-full">
                    {setBalance.isPending ? t("saving") : t("economySet")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </GlowCard>
      </Stagger>

      <PageTransition delay={200}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t("economyTotalBalances", { count: sorted.length })}
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder={t("economySearch")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-muted-foreground uppercase font-mono text-xs border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-medium tracking-wider">#</th>
                    <th className="px-6 py-4 font-medium tracking-wider">{t("economyUserId")}</th>
                    <th className="px-6 py-4 font-medium tracking-wider text-right">{t("economyBalance")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-8" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                        <td className="px-6 py-4 flex justify-end"><Skeleton className="h-6 w-20" /></td>
                      </tr>
                    ))
                  ) : filtered.length > 0 ? (
                    filtered.map((entry, idx) => (
                      <tr key={entry.userId} className="hover:bg-white/[0.03] transition-all group">
                        <td className="px-6 py-4 font-mono text-muted-foreground">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            idx === 0 ? "bg-yellow-500/20 text-yellow-400" :
                            idx === 1 ? "bg-gray-300/20 text-gray-300" :
                            idx === 2 ? "bg-orange-500/20 text-orange-400" :
                            "bg-white/5 text-muted-foreground"
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 border border-white/10">
                              <AvatarImage src={entry.avatar || undefined} />
                              <AvatarFallback className="text-xs bg-white/5">{(entry.username || entry.userId).substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium group-hover:text-foreground transition-colors">{entry.username || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground font-mono">{entry.userId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono font-bold text-primary">{entry.balance.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                        <Wallet className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>{t("economyNoData")}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </PageTransition>
    </div>
  );
}
