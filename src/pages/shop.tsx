import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Plus, X, Coins, Package, ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { PageTransition, Stagger, GlowCard } from "@/components/page-transitions";

const CURRENCY_NAME = "AetherCoin";

type ShopItem = { id: string; name: string; description: string | null; price: number; image_url: string | null };
type Channel = { id: string; name: string; type: number };

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be at least 1"),
  imageUrl: z.string().optional(),
});
type ItemFormValues = z.infer<typeof itemSchema>;

export default function Shop() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const { t } = useLanguage();
  const { data: shopData, isLoading } = useQuery({
    queryKey: ["shop"],
    queryFn: () => apiCall<{ items: ShopItem[]; channelId: string | null }>("/api/bot/shop"),
  });
  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ["channels"],
    queryFn: () => apiCall<Channel[]>("/api/bot/channels"),
  });

  const setChannel = useMutation({
    mutationFn: (channelId: string) =>
      apiCall("/api/bot/shop/channel", { method: "POST", body: JSON.stringify({ channelId }) }),
    onSuccess: () => {
      toast({ title: "Shop channel updated" });
      queryClient.invalidateQueries({ queryKey: ["shop"] });
    },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const createItem = useMutation({
    mutationFn: (data: ItemFormValues) =>
      apiCall("/api/bot/shop", {
        method: "POST",
        body: JSON.stringify({ name: data.name, description: data.description || null, price: data.price, imageUrl: data.imageUrl || null }),
      }),
    onSuccess: () => {
      toast({ title: "Item added" });
      form.reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["shop"] });
    },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => apiCall(`/api/bot/shop/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Item removed" });
      queryClient.invalidateQueries({ queryKey: ["shop"] });
    },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: "", description: "", price: 10, imageUrl: "" },
  });
  const items = shopData?.items || [];

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-cyan flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-[#00D4FF]" /> {t("shopTitle")}
            </h2>
            <p className="text-muted-foreground/60 mt-2 text-sm">{t("shopDesc", { currency: CURRENCY_NAME })}</p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)} className="bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/20">
            <Plus className="w-4 h-4 mr-2" />{t("addItem")}
          </Button>
        </div>
      </PageTransition>

      <PageTransition delay={50}>
        <div className="glass-cyan rounded-2xl border border-[#00D4FF]/10 p-4 flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground/50">
            <Package className="w-4 h-4 text-[#00D4FF]" />
            <span>{t("shopChannel")}</span>
          </div>
          <div className="flex-1">
            <Select value={shopData?.channelId || undefined} onValueChange={(val) => setChannel.mutate(val)}>
              <SelectTrigger className="bg-white/[0.03] border-white/[0.08] h-9 text-sm">
                <SelectValue placeholder={channelsLoading ? t("loadingChannels") : t("selectChannel")} />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {channels?.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}># {ch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PageTransition>

      {showForm && (
        <PageTransition>
          <div className="glass-cyan rounded-3xl border border-[#00D4FF]/10 p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-5">
              <ShoppingBag className="w-4 h-4 text-[#00D4FF]" />
              <h3 className="text-sm font-bold text-[#00D4FF]">{t("newItem")}</h3>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => createItem.mutate(v))} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground/50">{t("itemName")}</FormLabel>
                      <FormControl><Input placeholder={t("itemNamePlaceholder")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground/50">{t("price", { currency: CURRENCY_NAME })}</FormLabel>
                      <FormControl><Input type="number" min={1} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground/50">{t("imageUrl")}</FormLabel>
                    <FormControl><Input placeholder={t("imageUrlPlaceholder")} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground/50">{t("description")}</FormLabel>
                    <FormControl><Textarea placeholder={t("descPlaceholder")} className="resize-none" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="submit" disabled={createItem.isPending} className="bg-[#00D4FF]/15 hover:bg-[#00D4FF]/25 text-[#00D4FF] border border-[#00D4FF]/20">
                    {createItem.isPending ? t("saving") : t("saveItem")}
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => { setShowForm(false); form.reset(); }} className="text-muted-foreground/40">
                    {t("cancel")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </PageTransition>
      )}

      <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" staggerMs={60}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <Skeleton className="h-44 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))
          : items.length > 0
          ? items.map((item) => (
              <div key={item.id} className="group relative rounded-3xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-[#00D4FF]/15 transition-all duration-300">
                <button
                  onClick={() => deleteItem.mutate(item.id)}
                  disabled={deleteItem.isPending}
                  className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm border border-white/[0.1] flex items-center justify-center text-white/30 hover:text-red-400 hover:border-red-400/30 transition-all opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {item.image_url ? (
                  <div className="h-44 overflow-hidden bg-white/[0.02]">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-[#00D4FF]/5 to-[#8B5CF6]/5 flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-[#00D4FF]/15" />
                  </div>
                )}

                <div className="p-5">
                  <p className="font-bold text-sm mb-1 group-hover:text-[#00D4FF] transition-colors">{item.name}</p>
                  {item.description && <p className="text-xs text-muted-foreground/40 line-clamp-2 mb-3">{item.description}</p>}

                  <div className="flex items-center gap-1.5 bg-[#FFB800]/5 border border-[#FFB800]/10 rounded-xl px-3 py-1.5 w-fit">
                    <Coins className="w-3.5 h-3.5 text-[#FFB800]" />
                    <span className="font-mono font-bold text-sm text-[#FFB800]">{item.price}</span>
                    <span className="text-[10px] text-[#FFB800]/50">{CURRENCY_NAME}</span>
                  </div>
                </div>
              </div>
            ))
          : (
              <div className="col-span-full py-16 text-center text-muted-foreground/30 rounded-3xl border border-white/[0.04] border-dashed bg-white/[0.01]">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>{t("noItems")}</p>
                <p className="text-sm mt-1">{t("noItemsHint")}</p>
              </div>
            )}
      </Stagger>
    </div>
  );
}
