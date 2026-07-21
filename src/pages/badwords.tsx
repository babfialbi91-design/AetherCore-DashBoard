import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { ShieldBan, Plus, Trash2 } from "lucide-react";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

type BadWord = {
  id: string;
  word: string;
  action: string;
  timeoutMinutes: number | null;
};

type FormState = {
  word: string;
  action: string;
  timeoutMinutes: string;
};

const ACTIONS = ["delete", "warn", "timeout", "kick", "ban"] as const;

export default function Badwords() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({ word: "", action: "delete", timeoutMinutes: "" });

  const { data: badwords, isLoading } = useQuery({
    queryKey: ["badwords"],
    queryFn: () => apiCall<BadWord[]>("/api/bot/badwords"),
  });

  const createWord = useMutation({
    mutationFn: (body: { word: string; action: string; timeoutMinutes?: number }) =>
      apiCall<BadWord>("/api/bot/badwords", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast({ title: t("success") });
      queryClient.invalidateQueries({ queryKey: ["badwords"] });
      setForm({ word: "", action: "delete", timeoutMinutes: "" });
      setShowForm(false);
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const deleteWord = useMutation({
    mutationFn: (id: string) =>
      apiCall<{ ok: boolean }>(`/api/bot/badwords/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Word removed" });
      queryClient.invalidateQueries({ queryKey: ["badwords"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  function handleCreate() {
    if (!form.word.trim()) return;
    const body: { word: string; action: string; timeoutMinutes?: number } = {
      word: form.word.trim(),
      action: form.action,
    };
    if (form.action === "timeout" && form.timeoutMinutes) {
      body.timeoutMinutes = parseInt(form.timeoutMinutes, 10);
    }
    createWord.mutate(body);
  }

  function actionLabel(action: string) {
    switch (action) {
      case "delete": return t("badwordsActionDelete");
      case "warn": return t("badwordsActionWarn");
      case "timeout": return t("badwordsActionTimeout");
      case "kick": return t("badwordsActionKick");
      case "ban": return t("badwordsActionBan");
      default: return action;
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldBan className="w-8 h-8 text-primary" />
            {t("badwordsTitle")}
          </h2>
          <p className="text-muted-foreground mt-2">{t("badwordsDesc")}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} data-testid="button-toggle-form">
          <Plus className="w-4 h-4 mr-2" />
          {t("badwordsAdd")}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldBan className="w-4 h-4 text-primary" />
              {t("badwordsAdd")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("badwordsWord")}</label>
                <Input
                  value={form.word}
                  onChange={(e) => setForm((prev) => ({ ...prev, word: e.target.value }))}
                  placeholder="Enter word..."
                  className="bg-background/50 font-mono"
                  data-testid="input-word"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("badwordsAction")}</label>
                <Select
                  value={form.action}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, action: val }))}
                >
                  <SelectTrigger className="bg-background/50" data-testid="select-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {actionLabel(a)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.action === "timeout" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">{t("badwordsTimeout")}</label>
                  <Input
                    type="number"
                    min={1}
                    value={form.timeoutMinutes}
                    onChange={(e) => setForm((prev) => ({ ...prev, timeoutMinutes: e.target.value }))}
                    placeholder="Minutes"
                    className="bg-background/50"
                    data-testid="input-timeout"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCreate}
                disabled={createWord.isPending || !form.word.trim()}
                data-testid="button-submit-word"
              >
                {createWord.isPending ? t("loading") : t("badwordsAdd")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setForm({ word: "", action: "delete", timeoutMinutes: "" });
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
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : badwords && badwords.length > 0 ? (
          badwords.map((bw) => (
            <Card key={bw.id} className="bg-card/50 border-white/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <ShieldBan className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-sm bg-white/5 px-2 py-0.5 rounded" data-testid={`text-word-${bw.id}`}>
                        {bw.word}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{actionLabel(bw.action)}</span>
                        {bw.action === "timeout" && bw.timeoutMinutes != null && (
                          <span className="text-xs text-muted-foreground">({bw.timeoutMinutes}m)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={() => deleteWord.mutate(bw.id)}
                    disabled={deleteWord.isPending}
                    data-testid={`button-delete-word-${bw.id}`}
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
              <ShieldBan className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>{t("badwordsNoData")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
