import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { GitBranch, Plus, Trash2, X, ArrowRight } from "lucide-react";
import { PageTransition, Stagger, GlowCard } from "@/components/page-transitions";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

type AutoRule = { messageId: string; channelId: string; createdAt: string; mappings: { emoji: string; roleId: string }[] };
type Channel = { id: string; name: string; type: number };
type Role = { id: string; name: string; color: string };

export default function Autoroles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [channelId, setChannelId] = useState("");
  const [message, setMessage] = useState("");
  const [mappings, setMappings] = useState<{ emoji: string; roleId: string }[]>([{ emoji: "", roleId: "" }]);

  const { data: rules, isLoading } = useQuery({ queryKey: ["autorules"], queryFn: () => apiCall<AutoRule[]>("/api/bot/autorules") });
  const { data: channels } = useQuery({ queryKey: ["channels"], queryFn: () => apiCall<Channel[]>("/api/bot/channels") });
  const { data: roles } = useQuery({ queryKey: ["roles"], queryFn: () => apiCall<Role[]>("/api/bot/roles") });

  const createRule = useMutation({
    mutationFn: (body: { channelId: string; message: string; mappings: { emoji: string; roleId: string }[] }) =>
      apiCall<{ ok: boolean; messageId: string }>("/api/bot/autorules", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: t("success") });
      queryClient.invalidateQueries({ queryKey: ["autorules"] });
      setShowForm(false);
      setChannelId("");
      setMessage("");
      setMappings([{ emoji: "", roleId: "" }]);
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const deleteRule = useMutation({
    mutationFn: (messageId: string) => apiCall<{ ok: boolean }>(`/api/bot/autorules/${messageId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Rule deleted" });
      queryClient.invalidateQueries({ queryKey: ["autorules"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  function addMapping() { setMappings((prev) => [...prev, { emoji: "", roleId: "" }]); }
  function removeMapping(index: number) { setMappings((prev) => prev.filter((_, i) => i !== index)); }
  function updateMapping(index: number, field: "emoji" | "roleId", value: string) {
    setMappings((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }
  function handleCreate() {
    const validMappings = mappings.filter((m) => m.emoji && m.roleId);
    if (!channelId || !message || validMappings.length === 0) return;
    createRule.mutate({ channelId, message, mappings: validMappings });
  }

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-cyan flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center animate-float">
                <GitBranch className="w-5 h-5 text-[#00D4FF]" />
              </div>
              {t("autorulesTitle")}
            </h2>
            <p className="text-muted-foreground/60 mt-2 text-sm">{t("autorulesDesc")}</p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/20">
            <Plus className="w-4 h-4 mr-2" />{t("autorulesAdd")}
          </Button>
        </div>
      </PageTransition>

      {showForm && (
        <PageTransition>
          <GlowCard color="cyan">
            <Card className="glass-magenta rounded-3xl border-white/[0.06] overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-[#00D4FF]" />{t("autorulesAdd")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider mb-1.5 block">{t("autorulesChannel")}</label>
                  <Select value={channelId} onValueChange={setChannelId}>
                    <SelectTrigger className="rounded-xl bg-white/[0.03] border-white/[0.06]">
                      <SelectValue placeholder={t("selectChannel")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {channels?.map((ch) => (<SelectItem key={ch.id} value={ch.id}># {ch.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider mb-1.5 block">{t("autorulesMessage")}</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="The message to add reactions to..."
                    className="min-h-[80px] resize-none font-mono text-sm rounded-xl bg-white/[0.03] border-white/[0.06]"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider block">{t("autorulesMappings")}</label>
                  {mappings.map((mapping, i) => (
                    <div key={i} className="flex items-center gap-2 animate-slide-up">
                      <Input
                        value={mapping.emoji}
                        onChange={(e) => updateMapping(i, "emoji", e.target.value)}
                        placeholder={t("autorulesEmoji")}
                        className="w-24 font-mono rounded-xl bg-white/[0.03] border-white/[0.06]"
                      />
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
                      <Select value={mapping.roleId} onValueChange={(val) => updateMapping(i, "roleId", val)}>
                        <SelectTrigger className="flex-1 rounded-xl bg-white/[0.03] border-white/[0.06]">
                          <SelectValue placeholder={t("autorulesRole")} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {roles?.map((role) => (<SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      {mappings.length > 1 && (
                        <Button variant="ghost" size="icon" className="text-muted-foreground/40 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-xl" onClick={() => removeMapping(i)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addMapping} className="rounded-xl border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]">
                    <Plus className="w-3 h-3 mr-1" />{t("autorulesAddMapping")}
                  </Button>
                </div>
                <div className="flex gap-3 pt-1">
                  <Button onClick={handleCreate} disabled={createRule.isPending || !channelId || !message} className="rounded-xl bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/20">
                    {createRule.isPending ? t("loading") : t("autorulesCreate")}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowForm(false); setChannelId(""); setMessage(""); setMappings([{ emoji: "", roleId: "" }]); }} className="rounded-xl border-white/[0.06] bg-white/[0.02]">
                    {t("cancel")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </GlowCard>
        </PageTransition>
      )}

      <Stagger className="space-y-4" staggerMs={80}>
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-3xl" />) :
        rules && rules.length > 0 ? rules.map((rule) => (
          <Card key={rule.messageId} className="rounded-3xl border-white/[0.06] bg-white/[0.02] glass hover:bg-white/[0.03] transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Badge variant="outline" className="font-mono text-xs border-[#00D4FF]/20 text-[#00D4FF] bg-[#00D4FF]/5 rounded-lg">
                      {rule.messageId}
                    </Badge>
                    <span className="text-xs text-muted-foreground/40 font-mono">
                      #{channels?.find((c) => c.id === rule.channelId)?.name || rule.channelId}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rule.mappings.map((m, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 text-sm bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.04]">
                        <span className="font-mono">{m.emoji}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground/30" />
                        <span className="text-[#00D4FF]/80">{roles?.find((r) => r.id === m.roleId)?.name || m.roleId}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost" size="icon"
                  className="text-muted-foreground/40 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 flex-shrink-0 rounded-xl"
                  onClick={() => deleteRule.mutate(rule.messageId)}
                  disabled={deleteRule.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="py-20 text-center rounded-3xl border border-dashed border-white/[0.06] bg-white/[0.01] animate-fade-in">
            <GitBranch className="w-14 h-14 mx-auto mb-4 text-muted-foreground/15" />
            <p className="text-muted-foreground/30 text-sm">{t("autorulesNoData")}</p>
          </div>
        )}
      </Stagger>
    </div>
  );
}
