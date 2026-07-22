import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { ShieldBan, Plus, Trash2, ShieldCheck } from "lucide-react";
import { PageTransition, Stagger, GlowCard } from "@/components/page-transitions";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

type BadWord = { id: string; word: string; action: string; timeoutMinutes: number | null };
type FormState = { word: string; action: string; timeoutMinutes: string };
const ACTIONS = ["delete", "warn", "timeout", "kick", "ban"] as const;

const ACTION_COLORS: Record<string, string> = {
  delete: "bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/20",
  warn: "bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/20",
  timeout: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
  kick: "bg-[#FF006E]/10 text-[#FF006E] border-[#FF006E]/20",
  ban: "bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/20",
};

export default function Badwords() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({ word: "", action: "delete", timeoutMinutes: "" });
  const { data: badwords, isLoading } = useQuery({ queryKey: ["badwords"], queryFn: () => apiCall<BadWord[]>("/api/bot/badwords") });

  const createWord = useMutation({
    mutationFn: (body: { word: string; action: string; timeoutMinutes?: number }) =>
      apiCall<BadWord>("/api/bot/badwords", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: t("success") });
      queryClient.invalidateQueries({ queryKey: ["badwords"] });
      setForm({ word: "", action: "delete", timeoutMinutes: "" });
      setShowForm(false);
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const deleteWord = useMutation({
    mutationFn: (id: string) => apiCall<{ ok: boolean }>(`/api/bot/badwords/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Word removed" });
      queryClient.invalidateQueries({ queryKey: ["badwords"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  function handleCreate() {
    if (!form.word.trim()) return;
    const body: { word: string; action: string; timeoutMinutes?: number } = { word: form.word.trim(), action: form.action };
    if (form.action === "timeout" && form.timeoutMinutes) body.timeoutMinutes = parseInt(form.timeoutMinutes, 10);
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
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-magenta flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F43F5E]/10 flex items-center justify-center animate-float">
                <ShieldBan className="w-5 h-5 text-[#F43F5E]" />
              </div>
              {t("badwordsTitle")}
            </h2>
            <p className="text-muted-foreground/60 mt-2 text-sm">{t("badwordsDesc")}</p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/20">
            <Plus className="w-4 h-4 mr-2" />{t("badwordsAdd")}
          </Button>
        </div>
      </PageTransition>

      {showForm && (
        <PageTransition>
          <GlowCard color="magenta">
            <Card className="glass rounded-3xl border-white/[0.06] overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldBan className="w-4 h-4 text-[#F43F5E]" />{t("badwordsAdd")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider mb-1.5 block">{t("badwordsWord")}</label>
                    <Input
                      value={form.word}
                      onChange={(e) => setForm((prev) => ({ ...prev, word: e.target.value }))}
                      placeholder="Enter word..."
                      className="font-mono rounded-xl bg-white/[0.03] border-white/[0.06]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider mb-1.5 block">{t("badwordsAction")}</label>
                    <Select value={form.action} onValueChange={(val) => setForm((prev) => ({ ...prev, action: val }))}>
                      <SelectTrigger className="rounded-xl bg-white/[0.03] border-white/[0.06]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIONS.map((a) => (<SelectItem key={a} value={a}>{actionLabel(a)}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.action === "timeout" && (
                    <div className="animate-slide-up">
                      <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider mb-1.5 block">{t("badwordsTimeout")}</label>
                      <Input
                        type="number" min={1}
                        value={form.timeoutMinutes}
                        onChange={(e) => setForm((prev) => ({ ...prev, timeoutMinutes: e.target.value }))}
                        placeholder="Minutes"
                        className="rounded-xl bg-white/[0.03] border-white/[0.06]"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-1">
                  <Button onClick={handleCreate} disabled={createWord.isPending || !form.word.trim()} className="rounded-xl bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/20">
                    {createWord.isPending ? t("loading") : t("badwordsAdd")}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowForm(false); setForm({ word: "", action: "delete", timeoutMinutes: "" }); }} className="rounded-xl border-white/[0.06] bg-white/[0.02]">
                    {t("cancel")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </GlowCard>
        </PageTransition>
      )}

      <Stagger className="space-y-4" staggerMs={80}>
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-3xl" />) :
        badwords && badwords.length > 0 ? badwords.map((bw) => (
          <Card key={bw.id} className="rounded-3xl border-white/[0.06] bg-white/[0.02] glass hover:bg-white/[0.03] transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#F43F5E]/10 flex items-center justify-center flex-shrink-0">
                    <ShieldBan className="w-4.5 h-4.5 text-[#F43F5E]" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono text-sm bg-white/[0.04] text-[#F43F5E]/80 px-3 py-1 rounded-xl border border-[#F43F5E]/10">{bw.word}</span>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={`text-[10px] rounded-lg border ${ACTION_COLORS[bw.action] || "bg-white/[0.04] text-muted-foreground/50 border-white/[0.06]"}`}>
                        {actionLabel(bw.action)}
                      </Badge>
                      {bw.action === "timeout" && bw.timeoutMinutes != null && (
                        <span className="text-xs text-muted-foreground/40 font-mono">{bw.timeoutMinutes}m</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost" size="icon"
                  className="text-muted-foreground/40 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 flex-shrink-0 rounded-xl"
                  onClick={() => deleteWord.mutate(bw.id)}
                  disabled={deleteWord.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="py-20 text-center rounded-3xl border border-dashed border-white/[0.06] bg-white/[0.01] animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-[#10B981]/60" />
            </div>
            <p className="text-muted-foreground/30 text-sm font-medium">{t("badwordsNoData")}</p>
            <p className="text-muted-foreground/20 text-xs mt-1">No filtered words yet</p>
          </div>
        )}
      </Stagger>
    </div>
  );
}
