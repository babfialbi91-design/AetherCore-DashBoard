import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { ShoppingCart, Trash2, Coins, Package, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageTransition, Stagger, GlowCard } from "@/components/page-transitions";

type Purchase = { id: string; itemName: string; pricePaid: number; purchasedAt: string; userId: string; username: string; avatar: string; currentBalance: number };

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function getRowBorderColor(price: number): string {
  if (price >= 1000) return "border-l-amber";
  if (price >= 500) return "border-l-magenta";
  if (price >= 100) return "border-l-violet";
  return "border-l-emerald/40";
}

function getRowGlowColor(price: number): string {
  if (price >= 1000) return "hover:shadow-[0_0_20px_rgba(255,184,0,0.08)]";
  if (price >= 500) return "hover:shadow-[0_0_20px_rgba(255,0,110,0.08)]";
  if (price >= 100) return "hover:shadow-[0_0_20px_rgba(139,92,246,0.08)]";
  return "hover:shadow-[0_0_20px_rgba(16,185,129,0.06)]";
}

export default function Purchases() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [confirmClear, setConfirmClear] = useState(false);

  const { data: purchases, isLoading } = useQuery({ queryKey: ["purchases"], queryFn: () => apiCall<Purchase[]>("/api/bot/purchases") });
  const clearAll = useMutation({
    mutationFn: () => apiCall("/api/bot/purchases", { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: t("purchasesClear") });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      setConfirmClear(false);
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-bright/10 border border-cyan-bright/20 animate-float">
              <ShoppingCart className="w-7 h-7 text-cyan-bright" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gradient-cyan">{t("purchasesTitle")}</h2>
              <p className="text-muted-foreground/60 mt-1 text-sm">{t("purchasesDesc")}</p>
            </div>
          </div>
          {purchases && purchases.length > 0 && (
            <div className="relative">
              {confirmClear ? (
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-xs text-rose/70 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{t("purchasesClearConfirm")}</span>
                  <Button variant="destructive" size="sm" onClick={() => clearAll.mutate()} disabled={clearAll.isPending} className="rounded-xl">
                    <Trash2 className="w-3.5 h-3.5 mr-1" />Confirm
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)} className="rounded-xl text-muted-foreground/50">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="destructive" size="sm" onClick={() => setConfirmClear(true)} className="rounded-xl">
                  <Trash2 className="w-3.5 h-3.5 mr-1" />{t("purchasesClear")}
                </Button>
              )}
            </div>
          )}
        </div>
      </PageTransition>

      <PageTransition delay={100}>
        <Card className="rounded-3xl border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-muted-foreground/30 uppercase font-mono text-[10px] tracking-wider border-b border-white/[0.04]">
                  <tr>
                    <th className="px-6 py-4 font-bold">{t("purchasesBuyer")}</th>
                    <th className="px-6 py-4 font-bold">{t("purchasesItem")}</th>
                    <th className="px-6 py-4 font-bold">{t("purchasesPrice")}</th>
                    <th className="px-6 py-4 font-bold">{t("purchasesDate")}</th>
                    <th className="px-6 py-4 font-bold text-right">{t("purchasesBalance")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-8 w-40 rounded-xl" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-32 rounded-xl" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-xl" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-28 rounded-xl" /></td>
                        <td className="px-6 py-4 flex justify-end"><Skeleton className="h-6 w-16 rounded-xl" /></td>
                      </tr>
                    ))
                  ) : purchases && purchases.length > 0 ? (
                    <Stagger staggerMs={40}>
                      {purchases.map((p) => (
                        <tr key={p.id} className={`hover:bg-white/[0.02] transition-all group border-l-[3px] ${getRowBorderColor(p.pricePaid)} ${getRowGlowColor(p.pricePaid)}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9 border border-white/[0.08] ring-2 ring-white/[0.03]">
                                <AvatarImage src={p.avatar || undefined} />
                                <AvatarFallback className="text-[10px] bg-white/[0.05] font-semibold">{(p.username || p.userId).substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium group-hover:text-cyan-bright transition-colors">{p.username || "Unknown"}</p>
                                <p className="text-[10px] text-muted-foreground/30 font-mono">{p.userId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Package className="w-3.5 h-3.5 text-muted-foreground/25" />
                              <span className="font-medium">{p.itemName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 font-mono">
                              <Coins className="w-3.5 h-3.5 text-cyan-bright" />
                              <span className="text-cyan-bright font-semibold">{p.pricePaid.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground/50">{new Date(p.purchasedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right font-mono text-muted-foreground/40">{p.currentBalance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </Stagger>
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center animate-float">
                            <ShoppingCart className="w-10 h-10 text-muted-foreground/15" />
                          </div>
                          <div>
                            <p className="text-muted-foreground/30 text-sm font-medium">{t("purchasesNoData")}</p>
                            <p className="text-muted-foreground/15 text-xs mt-1">No purchases recorded yet</p>
                          </div>
                        </div>
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
