import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { GitBranch, Plus, Trash2, X } from "lucide-react";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

type AutoRule = {
  messageId: string;
  channelId: string;
  createdAt: string;
  mappings: { emoji: string; roleId: string }[];
};

type Channel = { id: string; name: string; type: number };
type Role = { id: string; name: string; color: string };

export default function Autoroles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [channelId, setChannelId] = useState("");
  const [message, setMessage] = useState("");
  const [mappings, setMappings] = useState<{ emoji: string; roleId: string }[]>([
    { emoji: "", roleId: "" },
  ]);

  const { data: rules, isLoading } = useQuery({
    queryKey: ["autorules"],
    queryFn: () => apiCall<AutoRule[]>("/api/bot/autorules"),
  });

  const { data: channels } = useQuery({
    queryKey: ["channels"],
    queryFn: () => apiCall<Channel[]>("/api/bot/channels"),
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiCall<Role[]>("/api/bot/roles"),
  });

  const createRule = useMutation({
    mutationFn: (body: { channelId: string; message: string; mappings: { emoji: string; roleId: string }[] }) =>
      apiCall<{ ok: boolean; messageId: string }>("/api/bot/autorules", {
        method: "POST",
        body: JSON.stringify(body),
      }),
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
    mutationFn: (messageId: string) =>
      apiCall<{ ok: boolean }>(`/api/bot/autorules/${messageId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Rule deleted" });
      queryClient.invalidateQueries({ queryKey: ["autorules"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  function addMapping() {
    setMappings((prev) => [...prev, { emoji: "", roleId: "" }]);
  }

  function removeMapping(index: number) {
    setMappings((prev) => prev.filter((_, i) => i !== index));
  }

  function updateMapping(index: number, field: "emoji" | "roleId", value: string) {
    setMappings((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  function handleCreate() {
    const validMappings = mappings.filter((m) => m.emoji && m.roleId);
    if (!channelId || !message || validMappings.length === 0) return;
    createRule.mutate({ channelId, message, mappings: validMappings });
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <GitBranch className="w-8 h-8 text-primary" />
            {t("autorulesTitle")}
          </h2>
          <p className="text-muted-foreground mt-2">{t("autorulesDesc")}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} data-testid="button-toggle-form">
          <Plus className="w-4 h-4 mr-2" />
          {t("autorulesAdd")}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-primary" />
              {t("autorulesAdd")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t("autorulesChannel")}</label>
              <Select value={channelId} onValueChange={setChannelId}>
                <SelectTrigger className="bg-background/50" data-testid="select-channel">
                  <SelectValue placeholder={t("selectChannel")} />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {channels?.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      # {ch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t("autorulesMessage")}</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="The message to add reactions to..."
                className="bg-background/50 min-h-[80px] resize-none font-mono text-sm"
                data-testid="input-message"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium block">{t("autorulesMappings")}</label>
              {mappings.map((mapping, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={mapping.emoji}
                    onChange={(e) => updateMapping(i, "emoji", e.target.value)}
                    placeholder={t("autorulesEmoji")}
                    className="bg-background/50 w-24 font-mono"
                    data-testid={`input-emoji-${i}`}
                  />
                  <Select value={mapping.roleId} onValueChange={(val) => updateMapping(i, "roleId", val)}>
                    <SelectTrigger className="bg-background/50 flex-1" data-testid={`select-role-${i}`}>
                      <SelectValue placeholder={t("autorulesRole")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mappings.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeMapping(i)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addMapping}>
                <Plus className="w-3 h-3 mr-1" />
                {t("autorulesAddMapping")}
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCreate}
                disabled={createRule.isPending || !channelId || !message}
                data-testid="button-create-rule"
              >
                {createRule.isPending ? t("loading") : t("autorulesCreate")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setChannelId("");
                  setMessage("");
                  setMappings([{ emoji: "", roleId: "" }]);
                }}
              >
                {t("cancel")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : rules && rules.length > 0 ? (
          rules.map((rule) => (
            <Card key={rule.messageId} className="bg-card/50 border-white/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {rule.messageId}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        #{channels?.find((c) => c.id === rule.channelId)?.name || rule.channelId}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rule.mappings.map((m, i) => (
                        <span key={i} className="text-sm bg-white/5 px-2 py-1 rounded border border-white/5">
                          {m.emoji} → {roles?.find((r) => r.id === m.roleId)?.name || m.roleId}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={() => deleteRule.mutate(rule.messageId)}
                    disabled={deleteRule.isPending}
                    data-testid={`button-delete-rule-${rule.messageId}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-card/50 border-white/5">
            <CardContent className="py-16 text-center text-muted-foreground">
              <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>{t("autorulesNoData")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
