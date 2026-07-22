import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Ticket, Settings, List, MessageSquare, Plus, Trash2, Save, Eye, X, RotateCcw } from "lucide-react";
import { PageTransition, Stagger, GlowCard } from "@/components/page-transitions";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

type TicketConfig = { channelId: string | null; staffRoleIds: string[]; panelTitle: string; panelDescription: string };
type TicketType = { id: string; value: string; label: string; emoji: string | null };
type Ticket = { id: string; type: string; status: string; channelId: string; createdAt: string; closedAt: string | null; hasTranscript: boolean; opener: { id: string; displayName: string; avatar: string | null }; claimedBy: { id: string; displayName: string; avatar: string | null } | null };
type Channel = { id: string; name: string; type: number };
type Role = { id: string; name: string; color: string };

const typeSchema = z.object({ label: z.string().min(1, "Label is required"), emoji: z.string().optional() });
type TypeFormValues = z.infer<typeof typeSchema>;

export default function Tickets() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [openMessage, setOpenMessage] = useState("");

  const { data: config, isLoading: loadingConfig } = useQuery({ queryKey: ["ticket-config"], queryFn: () => apiCall<TicketConfig>("/api/bot/tickets/config") });
  const { data: types, isLoading: loadingTypes } = useQuery({ queryKey: ["ticket-types"], queryFn: () => apiCall<TicketType[]>("/api/bot/tickets/types") });
  const { data: tickets, isLoading: loadingTickets } = useQuery({ queryKey: ["tickets"], queryFn: () => apiCall<Ticket[]>("/api/bot/tickets") });
  const { data: openMsgData, isLoading: loadingOpenMsg } = useQuery({ queryKey: ["ticket-open-message"], queryFn: () => apiCall<{ message: string }>("/api/bot/tickets/open-message") });
  const { data: channels, isLoading: channelsLoading } = useQuery({ queryKey: ["channels"], queryFn: () => apiCall<Channel[]>("/api/bot/channels") });
  const { data: roles } = useQuery({ queryKey: ["roles"], queryFn: () => apiCall<Role[]>("/api/bot/roles") });

  useEffect(() => { if (openMsgData?.message) setOpenMessage(openMsgData.message); }, [openMsgData]);

  const saveConfig = useMutation({
    mutationFn: (data: { channelId: string; staffRoleIds: string[]; panelTitle: string; panelDescription: string }) =>
      apiCall("/api/bot/tickets/config", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { toast({ title: t("success") }); queryClient.invalidateQueries({ queryKey: ["ticket-config"] }); },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const saveOpenMessage = useMutation({
    mutationFn: (message: string) => apiCall("/api/bot/tickets/open-message", { method: "POST", body: JSON.stringify({ message }) }),
    onSuccess: () => { toast({ title: t("success") }); queryClient.invalidateQueries({ queryKey: ["ticket-open-message"] }); },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const addType = useMutation({
    mutationFn: (data: TypeFormValues) => apiCall("/api/bot/tickets/types", { method: "POST", body: JSON.stringify({ label: data.label, emoji: data.emoji || null }) }),
    onSuccess: () => { toast({ title: t("success") }); typeForm.reset(); queryClient.invalidateQueries({ queryKey: ["ticket-types"] }); },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const deleteType = useMutation({
    mutationFn: (id: string) => apiCall(`/api/bot/tickets/types/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: t("success") }); queryClient.invalidateQueries({ queryKey: ["ticket-types"] }); },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const deleteTicket = useMutation({
    mutationFn: (id: string) => apiCall(`/api/bot/tickets/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: t("success") }); queryClient.invalidateQueries({ queryKey: ["tickets"] }); },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const clearClosed = useMutation({
    mutationFn: () => apiCall("/api/bot/tickets", { method: "DELETE" }),
    onSuccess: () => { toast({ title: t("success") }); queryClient.invalidateQueries({ queryKey: ["tickets"] }); },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const typeForm = useForm<TypeFormValues>({ resolver: zodResolver(typeSchema), defaultValues: { label: "", emoji: "" } });
  const [configState, setConfigState] = useState({ channelId: "", staffRoleIds: [] as string[], panelTitle: "", panelDescription: "" });
  useEffect(() => { if (config) setConfigState({ channelId: config.channelId || "", staffRoleIds: config.staffRoleIds || [], panelTitle: config.panelTitle || "", panelDescription: config.panelDescription || "" }); }, [config]);

  const channelName = (id: string) => channels?.find((c) => c.id === id)?.name || id;
  const roleName = (id: string) => roles?.find((r) => r.id === id)?.name || id;
  const closedTickets = tickets?.filter((t) => t.status === "closed") || [];
  const openTickets = tickets?.filter((t) => t.status === "open") || [];

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet/10 border border-violet/20 animate-float">
            <Ticket className="w-7 h-7 text-violet" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-violet">{t("ticketsTitle")}</h2>
            <p className="text-muted-foreground/60 mt-1 text-sm">{t("ticketsDesc")}</p>
          </div>
        </div>
      </PageTransition>

      <PageTransition delay={80}>
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="glass p-1.5 rounded-2xl">
            <TabsTrigger value="config" className="gap-2 rounded-xl data-[state=active]:bg-violet/15 data-[state=active]:text-violet data-[state=active]:border-violet/20 border border-transparent transition-all">
              <Settings className="w-4 h-4" />{t("ticketConfig")}
            </TabsTrigger>
            <TabsTrigger value="types" className="gap-2 rounded-xl data-[state=active]:bg-violet/15 data-[state=active]:text-violet data-[state=active]:border-violet/20 border border-transparent transition-all">
              <List className="w-4 h-4" />{t("ticketTypes")}
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2 rounded-xl data-[state=active]:bg-violet/15 data-[state=active]:text-violet data-[state=active]:border-violet/20 border border-transparent transition-all">
              <Ticket className="w-4 h-4" />{t("ticketList")}
            </TabsTrigger>
            <TabsTrigger value="message" className="gap-2 rounded-xl data-[state=active]:bg-violet/15 data-[state=active]:text-violet data-[state=active]:border-violet/20 border border-transparent transition-all">
              <MessageSquare className="w-4 h-4" />{t("ticketOpenMessage")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="animate-fade-in">
            <GlowCard color="violet">
              <Card className="border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet/10 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-violet" />
                    </div>
                    {t("ticketConfig")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loadingConfig ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full rounded-xl" />
                      <Skeleton className="h-20 w-full rounded-xl" />
                      <Skeleton className="h-10 w-full rounded-xl" />
                      <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2.5">
                        <label className="text-xs text-violet/70 font-semibold uppercase tracking-wider">{t("ticketChannel")}</label>
                        <Select value={configState.channelId} onValueChange={(v) => setConfigState((s) => ({ ...s, channelId: v }))}>
                          <SelectTrigger className="rounded-xl border-white/[0.06] bg-white/[0.02] focus:border-violet/40 focus:ring-violet/20">
                            <SelectValue placeholder={channelsLoading ? t("loading") : t("selectChannel")} />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto rounded-xl">{channels?.map((ch) => (<SelectItem key={ch.id} value={ch.id}># {ch.name}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-xs text-violet/70 font-semibold uppercase tracking-wider">{t("staffRoles")}</label>
                        <div className="flex flex-wrap gap-2">
                          {roles?.map((role) => {
                            const active = configState.staffRoleIds.includes(role.id);
                            return (
                              <Badge
                                key={role.id}
                                variant="outline"
                                className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-medium transition-all border ${
                                  active
                                    ? "bg-violet/15 text-violet border-violet/30 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                                    : "bg-white/[0.02] text-muted-foreground/50 border-white/[0.06] hover:border-violet/20 hover:text-violet/70"
                                }`}
                                onClick={() => setConfigState((s) => ({ ...s, staffRoleIds: s.staffRoleIds.includes(role.id) ? s.staffRoleIds.filter((id) => id !== role.id) : [...s.staffRoleIds, role.id] }))}
                              >
                                {active && <span className="w-1.5 h-1.5 rounded-full bg-violet mr-1.5 animate-pulse-neon" />}
                                {role.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-xs text-violet/70 font-semibold uppercase tracking-wider">{t("panelTitle")}</label>
                        <Input
                          value={configState.panelTitle}
                          onChange={(e) => setConfigState((s) => ({ ...s, panelTitle: e.target.value }))}
                          className="rounded-xl border-white/[0.06] bg-white/[0.02] focus:border-violet/40 focus:ring-violet/20"
                        />
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-xs text-violet/70 font-semibold uppercase tracking-wider">{t("panelDescription")}</label>
                        <Textarea
                          value={configState.panelDescription}
                          onChange={(e) => setConfigState((s) => ({ ...s, panelDescription: e.target.value }))}
                          className="resize-none rounded-xl border-white/[0.06] bg-white/[0.02] focus:border-violet/40 focus:ring-violet/20 min-h-[100px]"
                        />
                      </div>

                      <Button
                        onClick={() => saveConfig.mutate(configState)}
                        disabled={saveConfig.isPending || !configState.channelId || !configState.staffRoleIds.length}
                        className="rounded-xl bg-violet/20 hover:bg-violet/30 text-violet border border-violet/30 transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                      >
                        <Save className="w-4 h-4 mr-2" />{saveConfig.isPending ? t("loading") : t("saveTicketConfig")}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </GlowCard>
          </TabsContent>

          <TabsContent value="types" className="animate-fade-in">
            <div className="space-y-4">
              <GlowCard color="violet">
                <Card className="border-0 bg-transparent">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-violet/10 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-violet" />
                      </div>
                      {t("addTicketType")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...typeForm}>
                      <form onSubmit={typeForm.handleSubmit((v) => addType.mutate(v))} className="flex gap-3 items-end">
                        <FormField
                          control={typeForm.control}
                          name="emoji"
                          render={({ field }) => (
                            <FormItem className="w-24">
                              <FormLabel className="text-xs text-violet/70 font-semibold">{t("emoji")}</FormLabel>
                              <FormControl>
                                <Input placeholder="🎫" {...field} className="rounded-xl border-white/[0.06] bg-white/[0.02] focus:border-violet/40 focus:ring-violet/20 text-center text-lg" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={typeForm.control}
                          name="label"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-xs text-violet/70 font-semibold">{t("typeName")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("typeNamePlaceholder")} {...field} className="rounded-xl border-white/[0.06] bg-white/[0.02] focus:border-violet/40 focus:ring-violet/20" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={addType.isPending} className="mb-0.5 rounded-xl bg-violet/20 hover:bg-violet/30 text-violet border border-violet/30">
                          <Plus className="w-4 h-4 mr-1" />{t("addTicketType")}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </GlowCard>

              <Card className="rounded-3xl border-white/[0.06] bg-white/[0.02]">
                <CardContent className="pt-6">
                  {loadingTypes ? (
                    <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
                  ) : types && types.length > 0 ? (
                    <Stagger className="space-y-2" staggerMs={60}>
                      {types.map((type) => (
                        <div key={type.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-violet/15 transition-all group">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl bg-violet/10">{type.emoji || "📁"}</span>
                            <div>
                              <p className="font-medium group-hover:text-violet transition-colors">{type.label}</p>
                              <p className="text-xs text-muted-foreground/30 font-mono">{type.value}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-muted-foreground/30 hover:text-rose opacity-0 group-hover:opacity-100 transition-all" onClick={() => deleteType.mutate(type.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </Stagger>
                  ) : (
                    <p className="text-center text-muted-foreground/30 py-12 text-sm">{t("noTicketTypes")}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="animate-fade-in">
            <Card className="rounded-3xl border-white/[0.06] bg-white/[0.02]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet/10 flex items-center justify-center">
                    <Ticket className="w-4 h-4 text-violet" />
                  </div>
                  {t("ticketList")}
                </CardTitle>
                {closedTickets.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={() => clearClosed.mutate()} disabled={clearClosed.isPending} className="rounded-xl">
                    <Trash2 className="w-3.5 h-3.5 mr-1" />{t("clearClosed")} ({closedTickets.length})
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {loadingTickets ? (
                  <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
                ) : tickets && tickets.length > 0 ? (
                  <div className="space-y-2">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-violet/15 transition-all group">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ticket.status === "open" ? "bg-emerald animate-pulse-neon shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-white/10"}`} />
                          <div className="min-w-0">
                            <p className="font-medium truncate group-hover:text-violet transition-colors">{ticket.opener?.displayName || ticket.opener?.id}</p>
                            <p className="text-xs text-muted-foreground/40">{ticket.type} · {new Date(ticket.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Badge
                            variant={ticket.status === "open" ? "default" : "secondary"}
                            className={`rounded-xl text-[10px] font-semibold ${
                              ticket.status === "open"
                                ? "bg-emerald/15 text-emerald border-emerald/20"
                                : "bg-white/[0.03] text-muted-foreground/40 border-white/[0.06]"
                            }`}
                          >
                            {ticket.status}
                          </Badge>
                          {ticket.hasTranscript && (
                            <Button variant="ghost" size="icon" className="text-muted-foreground/30 hover:text-violet opacity-0 group-hover:opacity-100 transition-all" onClick={async () => {
                              const data = await apiCall<{ transcript: string }>(`/api/bot/tickets/${ticket.id}/transcript`);
                              if (data.transcript) { const w = window.open("", "_blank"); w?.document.write(`<pre>${data.transcript}</pre>`); }
                            }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="text-muted-foreground/30 hover:text-rose opacity-0 group-hover:opacity-100 transition-all" onClick={() => deleteTicket.mutate(ticket.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground/30 py-12 text-sm">{t("noTickets")}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="message" className="animate-fade-in">
            <GlowCard color="violet">
              <Card className="border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet/10 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-violet" />
                    </div>
                    {t("ticketOpenMessage")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {loadingOpenMsg ? (
                    <Skeleton className="h-36 w-full rounded-xl" />
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground/50">{t("ticketOpenMessageDesc")}</p>
                      <Textarea
                        value={openMessage}
                        onChange={(e) => setOpenMessage(e.target.value)}
                        placeholder={t("ticketOpenMessagePlaceholder")}
                        className="min-h-[140px] resize-none rounded-xl border-white/[0.06] bg-white/[0.02] focus:border-violet/40 focus:ring-violet/20 font-mono text-sm"
                      />
                      <div className="flex gap-3">
                        <Button
                          onClick={() => saveOpenMessage.mutate(openMessage)}
                          disabled={saveOpenMessage.isPending || !openMessage.trim()}
                          className="rounded-xl bg-violet/20 hover:bg-violet/30 text-violet border border-violet/30 transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                        >
                          <Save className="w-4 h-4 mr-2" />{saveOpenMessage.isPending ? t("loading") : t("save")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setOpenMessage("Hello {user}! A staff member will assist you shortly.\n\nPlease describe what you need below.")}
                          className="rounded-xl border-white/[0.06] text-muted-foreground/50 hover:text-violet hover:border-violet/20"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />{t("resetDefault")}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </GlowCard>
          </TabsContent>
        </Tabs>
      </PageTransition>
    </div>
  );
}
