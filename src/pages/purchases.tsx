import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { ShoppingCart, Trash2, Coins } from "lucide-react";

type Purchase = {
  id: string;
  itemName: string;
  pricePaid: number;
  purchasedAt: string;
  userId: string;
  username: string;
  avatar: string;
  currentBalance: number;
};

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function Purchases() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: purchases, isLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => apiCall<Purchase[]>("/api/bot/purchases"),
  });

  const clearAll = useMutation({
    mutationFn: () => apiCall("/api/bot/purchases", { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: t("purchasesClear") });
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const handleClear = () => {
    if (confirm(t("purchasesClearConfirm"))) {
      clearAll.mutate();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary" />
            {t("purchasesTitle")}
          </h2>
          <p className="text-muted-foreground mt-2">{t("purchasesDesc")}</p>
        </div>
        {purchases && purchases.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={clearAll.isPending}
            data-testid="button-clear-purchases"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t("purchasesClear")}
          </Button>
        )}
      </div>

      <Card className="bg-card/50 border-white/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-black/40 text-muted-foreground uppercase font-mono text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">{t("purchasesBuyer")}</th>
                  <th className="px-6 py-4 font-medium tracking-wider">{t("purchasesItem")}</th>
                  <th className="px-6 py-4 font-medium tracking-wider">{t("purchasesPrice")}</th>
                  <th className="px-6 py-4 font-medium tracking-wider">{t("purchasesDate")}</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">{t("purchasesBalance")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-40" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-28" /></td>
                      <td className="px-6 py-4 flex justify-end"><Skeleton className="h-6 w-16" /></td>
                    </tr>
                  ))
                ) : purchases && purchases.length > 0 ? (
                  purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.avatar ? (
                            <img src={p.avatar} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                              {(p.username || p.userId).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{p.username || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{p.itemName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-primary font-mono">
                          <Coins className="w-3.5 h-3.5" />
                          {p.pricePaid}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(p.purchasedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                        {p.currentBalance.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p>{t("purchasesNoData")}</p>
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
