import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { ShoppingCart, Trash2, Coins } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageTransition } from "@/components/page-transitions";

type Purchase = { id: string; itemName: string; pricePaid: number; purchasedAt: string; userId: string; username: string; avatar: string; currentBalance: number };

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function Purchases() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { data: purchases, isLoading } = useQuery({ queryKey: ["purchases"], queryFn: () => apiCall<Purchase[]>("/api/bot/purchases") });
  const clearAll = useMutation({
    mutationFn: () => apiCall("/api/bot/purchases", { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: t("purchasesClear") });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const handleClear = () => { if (confirm(t("purchasesClearConfirm"))) clearAll.mutate(); };

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-cyan" /> {t("purchasesTitle")}
            </h2>
            <p className="text-muted-foreground/60 mt-2 text-sm">{t("purchasesDesc")}</p>
          </div>
          {purchases && purchases.length > 0 && (
            <Button variant="destructive" onClick={handleClear} disabled={clearAll.isPending}><Trash2 className="w-4 h-4 mr-2" />{t("purchasesClear")}</Button>
          )}
        </div>
      </PageTransition>

      <PageTransition delay={100}>
        <Card>
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
                  {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-40" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-28" /></td>
                      <td className="px-6 py-4 flex justify-end"><Skeleton className="h-6 w-16" /></td>
                    </tr>
                  )) : purchases && purchases.length > 0 ? purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 border border-white/[0.08]"><AvatarImage src={p.avatar || undefined} /><AvatarFallback className="text-[10px] bg-white/[0.05]">{(p.username || p.userId).substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                          <div><p className="font-medium group-hover:text-foreground transition-colors">{p.username || "Unknown"}</p><p className="text-[10px] text-muted-foreground/30 font-mono">{p.userId}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{p.itemName}</td>
                      <td className="px-6 py-4"><div className="flex items-center gap-1 text-cyan font-mono"><Coins className="w-3.5 h-3.5" />{p.pricePaid}</div></td>
                      <td className="px-6 py-4 text-muted-foreground/50">{new Date(p.purchasedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right font-mono text-muted-foreground/40">{p.currentBalance.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground/30"><ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>{t("purchasesNoData")}</p></td></tr>
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
