import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Wallet, Search, Coins } from "lucide-react";

type EconomyEntry = { userId: string; balance: number };

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
    e.userId.toLowerCase().includes(search.toLowerCase())
  );

  const totalBalance = sorted.reduce((sum, e) => sum + e.balance, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Wallet className="w-8 h-8 text-primary" />
          {t("economyTitle")}
        </h2>
        <p className="text-muted-foreground mt-2">{t("economyDesc")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t("economyTotal")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-primary" />
                <span className="text-3xl font-bold font-mono text-primary">
                  {totalBalance.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("economyTotalBalances", { count: sorted.length })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t("economySetBalance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => setBalance.mutate(values))}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("economyUserId")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("economyUserId")}
                            {...field}
                            data-testid="input-economy-userid"
                            className="bg-background/50"
                          />
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
                        <FormLabel>{t("economyBalance")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            data-testid="input-economy-balance"
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={setBalance.isPending}
                  data-testid="button-economy-set"
                >
                  {setBalance.isPending ? t("saving") : t("economySet")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t("economyTotalBalances", { count: sorted.length })}
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("economySearch")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64 bg-background/50"
                data-testid="input-economy-search"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-black/40 text-muted-foreground uppercase font-mono text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">{t("rank")}</th>
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
                    <tr key={entry.userId} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-muted-foreground">
                        #{idx + 1}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {entry.userId}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-primary">
                        {entry.balance.toLocaleString()}
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
    </div>
  );
}
