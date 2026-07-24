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
import { Ticket, Settings, List, MessageSquare, Plus, Trash2, Save, Eye } from "lucide-react";
import { PageTransition, GlowCard } from "@/components/page-transitions";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

type TicketConfig = { channelId: string | null; staffRoleIds: string[]; panelTitle: string; panelDescription: string };
type TicketType = { id: string; value: string; label: string; emoji: string | null; openMessage: string | null };
type Ticket = { id: string; type: string; status: string; channelId: string; createdAt: string; closedAt: string | null; hasTranscript: boolean; opener: { id: string; displayName: string; avatar: string | null }; claimedBy: { id: string; displayName: string; avatar: string | null } | null };
type Channel = { id: string; name: string; type: number };
type Role = { id: string; name: string; color: string };

const typeSchema = z.object({ label: z.string().min(1, "Label is required"), emoji: z.string().optional(), openMessage: z.string().optional() });
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
    onSuccess: () => {
      toast({ title: t("success") });
      queryClient.invalidateQueries({ queryKey: ["ticket-config"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const saveOpenMessage = useMutation({
    mutationFn: (message: string) =>
      apiCall("/api/bot/tickets/open-message", { method: "POST", body: JSON.stringify({ message }) }),
    onSuccess: () => {
      toast({ title: t("success") });
      queryClient.invalidateQueries({ queryKey: ["ticket-open-message"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const addType = useMutation({
    mutationFn: (data: TypeFormValues) =>
      apiCall("/api/bot/tickets/types", { method: "POST", body: JSON.stringify({ label: data.label, emoji: data.emoji || null, openMessage: data.openMessage || null }) }),
    onSuccess: () => {
      toast({ title: t("success") });
      typeForm.reset();
      queryClient.invalidateQueries({ queryKey: ["ticket-types"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const deleteType = useMutation({
    mutationFn: (id: string) => apiCall(`/api/bot/tickets/types/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: t("success") });
      queryClient.invalidateQueries({ queryKey: ["ticket-types"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const deleteTicket = useMutation({
    mutationFn: (id: string) => apiCall(`/api/bot/tickets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: t("success") });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const clearClosed = useMutation({
    mutationFn: () => apiCall("/api/bot/tickets", { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: t("success") });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });
  const typeForm = useForm<TypeFormValues>({ resolver: zodResolver(typeSchema), defaultValues: { label: "", emoji: "", openMessage: "" } });

  const [configState, setConfigState] = useState({ channelId: "", staffRoleIds: [] as string[], panelTitle: "", panelDescription: "" });
  useEffect(() => { if (config) setConfigState({ channelId: config.channelId || "", staffRoleIds: config.staffRoleIds || [], panelTitle: config.panelTitle || "", panelDescription: config.panelDescription || "" }); }, [config]);

  const channelName = (id: string) => channels?.find((c) => c.id === id)?.name || id;
  const roleName = (id: string) => roles?.find((r) => r.id === id)?.name || id;
  const closedTickets = tickets?.filter((t) => t.status === "closed") || [];
  const openTickets = tickets?.filter((t) => t.status === "open") || [];

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber flex items-center gap-3">
            <Ticket className="w-8 h-8 text-cyan" /> {t("ticketsTitle")}
          </h2>
          <p className="text-muted-foreground/60 mt-2 text-sm">{t("ticketsDesc")}</p>
        </div>
      </PageTransition>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="bg-white/[0.03] border border-white/[0.06]">
          <TabsTrigger value="config" className="gap-2"><Settings className="w-4 h-4" />{t("ticketConfig")}</TabsTrigger>
          <TabsTrigger value="types" className="gap-2"><List className="w-4 h-4" />{t("ticketTypes")}</TabsTrigger>
          <TabsTrigger value="tickets" className="gap-2"><Ticket className="w-4 h-4" />{t("ticketList")}</TabsTrigger>
          <TabsTrigger value="message" className="gap-2"><MessageSquare className="w-4 h-4" />{t("ticketOpenMessage")}</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Settings className="w-4 h-4 text-cyan" />{t("ticketConfig")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {loadingConfig ? <Skeleton className="h-64 w-full" /> : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider">{t("ticketChannel")}</label>
                    <Select value={configState.channelId} onValueChange={(v) => setConfigState((s) => ({ ...s, channelId: v }))}>
                      <SelectTrigger><SelectValue placeholder={channelsLoading ? t("loading") : t("selectChannel")} /></SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">{channels?.map((ch) => (<SelectItem key={ch.id} value={ch.id}># {ch.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider">{t("staffRoles")}</label>
                    <div className="flex flex-wrap gap-2">
                      {roles?.map((role) => (<Badge key={role.id} variant={configState.staffRoleIds.includes(role.id) ? "default" : "outline"} className="cursor-pointer" onClick={() => setConfigState((s) => ({ ...s, staffRoleIds: s.staffRoleIds.includes(role.id) ? s.staffRoleIds.filter((id) => id !== role.id) : [...s.staffRoleIds, role.id] }))}>{role.name}</Badge>))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider">{t("panelTitle")}</label>
                    <Input value={configState.panelTitle} onChange={(e) => setConfigState((s) => ({ ...s, panelTitle: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider">{t("panelDescription")}</label>
                    <Textarea value={configState.panelDescription} onChange={(e) => setConfigState((s) => ({ ...s, panelDescription: e.target.value }))} className="resize-none" />
                  </div>
                  <Button onClick={() => saveConfig.mutate(configState)} disabled={saveConfig.isPending || !configState.channelId || !configState.staffRoleIds.length}>
                    <Save className="w-4 h-4 mr-2" />{saveConfig.isPending ? t("loading") : t("saveTicketConfig")}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Plus className="w-4 h-4 text-cyan" />{t("addTicketType")}</CardTitle></CardHeader>
              <CardContent>
                <Form {...typeForm}>
                  <form onSubmit={typeForm.handleSubmit((v) => addType.mutate(v))} className="space-y-3">
                    <div className="flex gap-3 items-end">
                      <FormField control={typeForm.control} name="emoji" render={({ field }) => (<FormItem className="w-24"><FormLabel className="text-xs text-muted-foreground/50">{t("emoji")}</FormLabel><FormControl><Input placeholder="🎫" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={typeForm.control} name="label" render={({ field }) => (<FormItem className="flex-1"><FormLabel className="text-xs text-muted-foreground/50">{t("typeName")}</FormLabel><FormControl><Input placeholder={t("typeNamePlaceholder")} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={typeForm.control} name="openMessage" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("ticketTypeOpenMessage")}</FormLabel><FormControl><Textarea placeholder={t("ticketTypeOpenMessagePlaceholder")} className="min-h-[80px] resize-none font-mono text-sm" {...field} /></FormControl><p className="text-[10px] text-muted-foreground/30">{t("ticketTypeOpenMessageHint")}</p><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" disabled={addType.isPending}><Plus className="w-4 h-4 mr-1" />{t("addTicketType")}</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                {loadingTypes ? <Skeleton className="h-32 w-full" /> : types && types.length > 0 ? (
                  <div className="space-y-2">
                    {types.map((type) => (
                      <div key={type.id} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{type.emoji || "📁"}</span>
                            <div><p className="font-medium">{type.label}</p><p className="text-xs text-muted-foreground/30 font-mono">{type.value}</p></div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-muted-foreground/40 hover:text-red-400" onClick={() => deleteType.mutate(type.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                        {type.openMessage && (
                          <div className="mt-2 ml-9 p-2 bg-purple/[0.05] border border-purple/10 rounded-lg">
                            <p className="text-[10px] text-purple/60 font-bold uppercase tracking-wider mb-1">{t("ticketTypeOpenMessage")}</p>
                            <p className="text-xs text-muted-foreground/60 whitespace-pre-wrap">{type.openMessage}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center text-muted-foreground/30 py-8">{t("noTicketTypes")}</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><Ticket className="w-4 h-4 text-cyan" />{t("ticketList")}</CardTitle>
              {closedTickets.length > 0 && <Button variant="destructive" size="sm" onClick={() => clearClosed.mutate()} disabled={clearClosed.isPending}><Trash2 className="w-3.5 h-3.5 mr-1" />{t("clearClosed")} ({closedTickets.length})</Button>}
            </CardHeader>
            <CardContent>
              {loadingTickets ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div> :
              tickets && tickets.length > 0 ? (
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant={ticket.status === "open" ? "default" : "secondary"} className={`flex-shrink-0 ${ticket.status === "open" ? "bg-green-500/15 text-green-400 border-green-500/20" : "bg-white/[0.03] text-muted-foreground/40 border-white/[0.06]"}`}>{ticket.status}</Badge>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{ticket.opener?.displayName || ticket.opener?.id}</p>
                          <p className="text-xs text-muted-foreground/40">{ticket.type} · {new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {ticket.hasTranscript && <Button variant="ghost" size="icon" className="text-muted-foreground/40" onClick={async () => { const data = await apiCall<{ transcript: string }>(`/api/bot/tickets/${ticket.id}/transcript`); if (data.transcript) { const w = window.open("", "_blank"); w?.document.write(`<pre>${data.transcript}</pre>`); } }}><Eye className="w-4 h-4" /></Button>}
                        <Button variant="ghost" size="icon" className="text-muted-foreground/40 hover:text-red-400" onClick={() => deleteTicket.mutate(ticket.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center text-muted-foreground/30 py-8">{t("noTickets")}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="message">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="w-4 h-4 text-cyan" />{t("ticketOpenMessage")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {loadingOpenMsg ? <Skeleton className="h-32 w-full" /> : (
                <>
                  <p className="text-sm text-muted-foreground/50">{t("ticketOpenMessageDesc")}</p>
                  <Textarea value={openMessage} onChange={(e) => setOpenMessage(e.target.value)} placeholder={t("ticketOpenMessagePlaceholder")} className="min-h-[120px] resize-none font-mono text-sm" />
                  <div className="flex gap-3">
                    <Button onClick={() => saveOpenMessage.mutate(openMessage)} disabled={saveOpenMessage.isPending || !openMessage.trim()}>
                      <Save className="w-4 h-4 mr-2" />{saveOpenMessage.isPending ? t("loading") : t("save")}
                    </Button>
                    <Button variant="outline" onClick={() => setOpenMessage("Hello {user}! A staff member will assist you shortly.\n\nPlease describe what you need below.")}>{t("resetDefault")}</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
