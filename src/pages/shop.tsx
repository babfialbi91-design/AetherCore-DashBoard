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
import { ShoppingBag, Plus, Trash2, Coins } from "lucide-react";
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

const itemSchema = z.object({ name: z.string().min(1, "Name is required"), description: z.string().optional(), price: z.coerce.number().min(1, "Price must be at least 1"), imageUrl: z.string().optional() });
type ItemFormValues = z.infer<typeof itemSchema>;

export default function Shop() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const { t } = useLanguage();
  const { data: shopData, isLoading } = useQuery({ queryKey: ["shop"], queryFn: () => apiCall<{ items: ShopItem[]; channelId: string | null }>("/api/bot/shop") });
  const { data: channels, isLoading: channelsLoading } = useQuery({ queryKey: ["channels"], queryFn: () => apiCall<Channel[]>("/api/bot/channels") });

  const setChannel = useMutation({
    mutationFn: (channelId: string) => apiCall("/api/bot/shop/channel", { method: "POST", body: JSON.stringify({ channelId }) }),
    onSuccess: () => {
      toast({ title: "Shop channel updated" });
      queryClient.invalidateQueries({ queryKey: ["shop"] });
    },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });
  const createItem = useMutation({
    mutationFn: (data: ItemFormValues) =>
      apiCall("/api/bot/shop", { method: "POST", body: JSON.stringify({ name: data.name, description: data.description || null, price: data.price, imageUrl: data.imageUrl || null }) }),
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
  const form = useForm<ItemFormValues>({ resolver: zodResolver(itemSchema), defaultValues: { name: "", description: "", price: 10, imageUrl: "" } });
  const items = shopData?.items || [];

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-cyan" /> {t("shopTitle")}
            </h2>
            <p className="text-muted-foreground/60 mt-2 text-sm">{t("shopDesc", { currency: CURRENCY_NAME })}</p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)}><Plus className="w-4 h-4 mr-2" />{t("addItem")}</Button>
        </div>
      </PageTransition>

      <PageTransition delay={50}>
        <Card>
          <CardHeader><CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">{t("shopChannel")}</CardTitle></CardHeader>
          <CardContent>
            <Select value={shopData?.channelId || undefined} onValueChange={(val) => setChannel.mutate(val)}>
              <SelectTrigger className="max-w-sm"><SelectValue placeholder={channelsLoading ? t("loadingChannels") : t("selectChannel")} /></SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">{channels?.map((ch) => (<SelectItem key={ch.id} value={ch.id}># {ch.name}</SelectItem>))}</SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground/30 mt-2">{t("shopChannelDesc")}</p>
          </CardContent>
        </Card>
      </PageTransition>

      {showForm && (
        <PageTransition>
          <GlowCard color="cyan">
            <Card className="border-0 bg-transparent">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-cyan" />{t("newItem")}</CardTitle></CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((v) => createItem.mutate(v))} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("itemName")}</FormLabel><FormControl><Input placeholder={t("itemNamePlaceholder")} {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("price", { currency: CURRENCY_NAME })}</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("imageUrl")}</FormLabel><FormControl><Input placeholder={t("imageUrlPlaceholder")} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("description")}</FormLabel><FormControl><Textarea placeholder={t("descPlaceholder")} className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="flex gap-3">
                      <Button type="submit" disabled={createItem.isPending}>{createItem.isPending ? t("saving") : t("saveItem")}</Button>
                      <Button variant="outline" type="button" onClick={() => { setShowForm(false); form.reset(); }}>{t("cancel")}</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </GlowCard>
        </PageTransition>
      )}

      <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" staggerMs={60}>
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>) :
        items.length > 0 ? items.map((item) => (
          <GlowCard key={item.id} color="cyan">
            <Card className="border-0 bg-transparent overflow-hidden">
              {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover" />}
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{item.name}</p>
                    {item.description && <p className="text-sm text-muted-foreground/50 mt-1 line-clamp-2">{item.description}</p>}
                    <div className="flex items-center gap-1 mt-2 text-cyan font-mono text-sm"><Coins className="w-3.5 h-3.5" />{item.price} {CURRENCY_NAME}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground/40 hover:text-red-400 hover:bg-red-400/10 flex-shrink-0" onClick={() => deleteItem.mutate(item.id)} disabled={deleteItem.isPending}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          </GlowCard>
        )) : (
          <div className="col-span-full py-16 text-center text-muted-foreground/30 rounded-2xl border border-white/[0.04] border-dashed bg-white/[0.01]">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>{t("noItems")}</p><p className="text-sm mt-1">{t("noItemsHint")}</p>
          </div>
        )}
      </Stagger>
    </div>
  );
}
