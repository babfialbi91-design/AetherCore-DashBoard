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

const CURRENCY_NAME = "AetherCoin";

type EventItem = {
  id: string;
  name: string;
  description: string | null;
  channel_id: string;
  winner_count: number;
  coin_reward: number;
  participants: string[];
  winners: string[];
  status: "open" | "ended";
  created_at: string;
};

type Channel = { id: string; name: string; type: number };

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  channelId: z.string().min(1, "Select a channel"),
  winnerCount: z.coerce.number().min(1, "At least 1 winner"),
  coinReward: z.coerce.number().min(1, "Reward must be at least 1"),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function Events() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const { t } = useLanguage();

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => apiCall<EventItem[]>("/api/bot/events"),
  });

  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ["channels"],
    queryFn: () => apiCall<Channel[]>("/api/bot/channels"),
  });

  const createEvent = useMutation({
    mutationFn: (data: EventFormValues) =>
      apiCall("/api/bot/events", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          channelId: data.channelId,
          winnerCount: data.winnerCount,
          coinReward: data.coinReward,
        }),
      }),
    onSuccess: () => {
      toast({ title: "Event created and posted" });
      form.reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast({ title: "Failed to create event", variant: "destructive" }),
  });

  const endEvent = useMutation({
    mutationFn: (id: string) => apiCall(`/api/bot/events/${id}/end`, { method: "POST" }),
    onSuccess: () => {
      toast({ title: "Winners drawn and paid out" });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast({ title: "Failed to end event", variant: "destructive" }),
  });

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: { name: "", description: "", channelId: "", winnerCount: 1, coinReward: 50 },
  });

  const channelName = (id: string) => channels?.find((c) => c.id === id)?.name || id;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("eventsTitle")}</h2>
          <p className="text-muted-foreground mt-2">
            {t("eventsDesc", { currency: CURRENCY_NAME })}
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} data-testid="button-toggle-form">
          <Plus className="w-4 h-4 mr-2" />
          {t("newEvent")}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PartyPopper className="w-4 h-4 text-primary" />
              {t("newEvent")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((values) => createEvent.mutate(values))} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("eventName")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("eventNamePlaceholder")} {...field} data-testid="input-event-name" className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="channelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("channel")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50" data-testid="select-event-channel">
                              <SelectValue placeholder={channelsLoading ? t("loadingChannels") : t("selectChannel")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {channels?.map((ch) => (
                              <SelectItem key={ch.id} value={ch.id} data-testid={`option-channel-${ch.id}`}>
                                # {ch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="winnerCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("winnerCount")}</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} data-testid="input-winner-count" className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="coinReward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("rewardPerWinner", { currency: CURRENCY_NAME })}</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} data-testid="input-coin-reward" className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("eventDesc")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("eventDescPlaceholder")}
                          className="bg-background/50 resize-none"
                          {...field}
                          data-testid="textarea-event-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <Button type="submit" disabled={createEvent.isPending} data-testid="button-submit-event">
                    {createEvent.isPending ? t("posting") : t("createPost")}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      form.reset();
                    }}
                    data-testid="button-cancel"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
        ) : events && events.length > 0 ? (
          events.map((event, i) => (
            <Card
              key={event.id}
              className="bg-card/50 border-white/5 hover:border-primary/30 transition-colors"
              data-testid={`card-event-${i}`}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold" data-testid={`text-event-name-${i}`}>
                        {event.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono uppercase tracking-wide ${
                          event.status === "open"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-white/5 text-muted-foreground border border-white/10"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Flag className="w-3.5 h-3.5 text-primary" /># {channelName(event.channel_id)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        {(event.participants || []).length} {t("entries")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-primary" />
                        {event.winner_count} {t("winners")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-primary" />
                        {event.coin_reward} {CURRENCY_NAME} each
                      </span>
                    </div>
                    {event.status === "ended" && event.winners?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("winners")}</p>
                        <p className="text-sm text-primary font-mono">
                          {event.winners.map((w) => `<@${w}>`).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                  {event.status === "open" && (
                    <Button
                      size="sm"
                      onClick={() => endEvent.mutate(event.id)}
                      disabled={endEvent.isPending}
                      data-testid={`button-end-event-${i}`}
                    >
                      <Trophy className="w-3.5 h-3.5 mr-1.5" />
                      {t("endDraw")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-card/50 border-white/5">
            <CardContent className="py-16 text-center text-muted-foreground">
              <PartyPopper className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>{t("noEvents")}</p>
              <p className="text-sm mt-1">{t("noEventsHint")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
