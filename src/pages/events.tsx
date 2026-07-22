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
import { PartyPopper, Plus, Trophy, Users, Coins, Flag } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { PageTransition, Stagger, GlowCard } from "@/components/page-transitions";

const CURRENCY_NAME = "AetherCoin";
type EventItem = { id: string; name: string; description: string | null; channel_id: string; winner_count: number; coin_reward: number; participants: string[]; winners: string[]; status: "open" | "ended"; created_at: string };
type Channel = { id: string; name: string; type: number };

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const eventSchema = z.object({ name: z.string().min(1), description: z.string().optional(), channelId: z.string().min(1), winnerCount: z.coerce.number().min(1), coinReward: z.coerce.number().min(1) });
type EventFormValues = z.infer<typeof eventSchema>;

export default function Events() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const { t } = useLanguage();
  const { data: events, isLoading } = useQuery({ queryKey: ["events"], queryFn: () => apiCall<EventItem[]>("/api/bot/events") });
  const { data: channels, isLoading: channelsLoading } = useQuery({ queryKey: ["channels"], queryFn: () => apiCall<Channel[]>("/api/bot/channels") });
  const createEvent = useMutation({
    mutationFn: (data: EventFormValues) =>
      apiCall("/api/bot/events", { method: "POST", body: JSON.stringify({ name: data.name, description: data.description || null, channelId: data.channelId, winnerCount: data.winnerCount, coinReward: data.coinReward }) }),
    onSuccess: () => {
      toast({ title: "Event created" });
      form.reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });
  const endEvent = useMutation({
    mutationFn: (id: string) => apiCall(`/api/bot/events/${id}/end`, { method: "POST" }),
    onSuccess: () => {
      toast({ title: "Winners drawn" });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });
  const form = useForm<EventFormValues>({ resolver: zodResolver(eventSchema), defaultValues: { name: "", description: "", channelId: "", winnerCount: 1, coinReward: 50 } });
  const channelName = (id: string) => channels?.find((c) => c.id === id)?.name || id;

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber flex items-center gap-3">
              <PartyPopper className="w-8 h-8 text-cyan" /> {t("eventsTitle")}
            </h2>
            <p className="text-muted-foreground/60 mt-2 text-sm">{t("eventsDesc", { currency: CURRENCY_NAME })}</p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)}><Plus className="w-4 h-4 mr-2" />{t("newEvent")}</Button>
        </div>
      </PageTransition>

      {showForm && (
        <PageTransition>
          <GlowCard color="cyan">
            <Card className="border-0 bg-transparent">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><PartyPopper className="w-4 h-4 text-cyan" />{t("newEvent")}</CardTitle></CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((v) => createEvent.mutate(v))} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("eventName")}</FormLabel><FormControl><Input placeholder={t("eventNamePlaceholder")} {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="channelId" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("channel")}</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={channelsLoading ? t("loadingChannels") : t("selectChannel")} /></SelectTrigger></FormControl><SelectContent className="max-h-60 overflow-y-auto">{channels?.map((ch) => (<SelectItem key={ch.id} value={ch.id}># {ch.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField control={form.control} name="winnerCount" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("winnerCount")}</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="coinReward" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("rewardPerWinner", { currency: CURRENCY_NAME })}</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("eventDesc")}</FormLabel><FormControl><Textarea placeholder={t("eventDescPlaceholder")} className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="flex gap-3">
                      <Button type="submit" disabled={createEvent.isPending}>{createEvent.isPending ? t("posting") : t("createPost")}</Button>
                      <Button variant="outline" type="button" onClick={() => { setShowForm(false); form.reset(); }}>{t("cancel")}</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </GlowCard>
        </PageTransition>
      )}

      <Stagger className="space-y-4" staggerMs={80}>
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>) :
        events && events.length > 0 ? events.map((event) => (
          <GlowCard key={event.id} color="cyan">
            <Card className="border-0 bg-transparent">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold">{event.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${event.status === "open" ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-white/[0.03] text-muted-foreground/40 border border-white/[0.06]"}`}>{event.status}</span>
                    </div>
                    {event.description && <p className="text-sm text-muted-foreground/50 mb-2">{event.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground/40 flex-wrap">
                      <span className="flex items-center gap-1"><Flag className="w-3.5 h-3.5 text-cyan" /># {channelName(event.channel_id)}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-cyan" />{(event.participants || []).length} {t("entries")}</span>
                      <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-cyan" />{event.winner_count} {t("winners")}</span>
                      <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-cyan" />{event.coin_reward} {CURRENCY_NAME} each</span>
                    </div>
                    {event.status === "ended" && event.winners?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/[0.04]">
                        <p className="text-[10px] text-muted-foreground/30 uppercase tracking-wider mb-1 font-bold">{t("winners")}</p>
                        <p className="text-sm text-cyan font-mono">{event.winners.map((w) => `<@${w}>`).join(", ")}</p>
                      </div>
                    )}
                  </div>
                  {event.status === "open" && <Button size="sm" onClick={() => endEvent.mutate(event.id)} disabled={endEvent.isPending}><Trophy className="w-3.5 h-3.5 mr-1.5" />{t("endDraw")}</Button>}
                </div>
              </CardContent>
            </Card>
          </GlowCard>
        )) : (
          <div className="py-16 text-center text-muted-foreground/30 rounded-2xl border border-white/[0.04] border-dashed bg-white/[0.01]">
            <PartyPopper className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>{t("noEvents")}</p><p className="text-sm mt-1">{t("noEventsHint")}</p>
          </div>
        )}
      </Stagger>
    </div>
  );
}
