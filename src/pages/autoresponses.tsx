import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Bot, Plus, Zap, Trash2, MessageCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { PageTransition, Stagger, GlowCard } from "@/components/page-transitions";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const schema = z.object({
  trigger: z.string().min(1, "Trigger is required"),
  response: z.string().min(1, "Response is required"),
  embedTitle: z.string().optional(),
  embedColor: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function AutoResponses() {
  const { data, isLoading } = useQuery({ queryKey: ["autoresponses"], queryFn: () => apiCall<any[]>("/api/bot/autoresponses") });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const { t } = useLanguage();

  const create = useMutation({
    mutationFn: (body: { trigger: string; response: string; embedTitle: string | null; embedColor: string | null }) =>
      apiCall("/api/bot/autoresponses", { method: "POST", body: JSON.stringify(body) }),
  });

  const remove = useMutation({ mutationFn: (id: string) => apiCall(`/api/bot/autoresponses/${id}`, { method: "DELETE" }) });
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { trigger: "", response: "", embedTitle: "", embedColor: "" },
  });

  function onSubmit(values: FormValues) {
    create.mutate(
      { trigger: values.trigger, response: values.response, embedTitle: values.embedTitle || null, embedColor: values.embedColor || null },
      {
        onSuccess: () => {
          toast({ title: "Auto-response added" });
          form.reset();
          setShowForm(false);
          queryClient.invalidateQueries({ queryKey: ["autoresponses"] });
        },
        onError: () => toast({ title: "Failed", variant: "destructive" }),
      }
    );
  }

  function onDelete(id: string | null | undefined) {
    if (!id) return;
    remove.mutate(id, {
      onSuccess: () => {
        toast({ title: "Auto-response removed" });
        queryClient.invalidateQueries({ queryKey: ["autoresponses"] });
      },
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-amber flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFB800]/10 flex items-center justify-center animate-float">
                <Bot className="w-5 h-5 text-[#FFB800]" />
              </div>
              {t("autoResponsesTitle")}
            </h2>
            <p className="text-muted-foreground/60 mt-2 text-sm">{t("autoResponsesDesc")}</p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)} className="rounded-xl bg-[#FFB800]/10 hover:bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/20">
            <Plus className="w-4 h-4 mr-2" />{t("addResponse")}
          </Button>
        </div>
      </PageTransition>

      {showForm && (
        <PageTransition>
          <GlowCard color="amber">
            <Card className="glass rounded-3xl border-white/[0.06] overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FFB800]" />{t("newAutoResponse")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control} name="trigger"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider">{t("triggerKeyword")}</FormLabel>
                            <FormControl><Input placeholder={t("triggerPlaceholder")} {...field} className="rounded-xl bg-white/[0.03] border-white/[0.06]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control} name="embedTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider">{t("embedTitle")}</FormLabel>
                            <FormControl><Input placeholder={t("embedTitlePlaceholder")} {...field} className="rounded-xl bg-white/[0.03] border-white/[0.06]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control} name="response"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider">{t("responseText")}</FormLabel>
                          <FormControl><Input placeholder={t("responsePlaceholder")} {...field} className="rounded-xl bg-white/[0.03] border-white/[0.06]" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-3 pt-1">
                      <Button type="submit" disabled={create.isPending} className="rounded-xl bg-[#FFB800]/10 hover:bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/20">
                        {create.isPending ? t("saving") : t("saveResponse")}
                      </Button>
                      <Button variant="outline" type="button" onClick={() => { setShowForm(false); form.reset(); }} className="rounded-xl border-white/[0.06] bg-white/[0.02]">
                        {t("cancel")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </GlowCard>
        </PageTransition>
      )}

      <Stagger className="space-y-4" staggerMs={60}>
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-3xl" />) :
        data && data.length > 0 ? data.map((ar, i) => (
          <Card key={ar.id ?? i} className="rounded-3xl border-white/[0.06] bg-white/[0.02] glass hover:bg-white/[0.03] transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FFB800]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageCircle className="w-4.5 h-4.5 text-[#FFB800]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-mono text-sm bg-[#FFB800]/5 text-[#FFB800] px-2.5 py-0.5 rounded-lg border border-[#FFB800]/10">
                        {ar.trigger}
                      </span>
                      {ar.embedTitle && <span className="text-xs text-muted-foreground/40 italic">— {ar.embedTitle}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground/50 truncate max-w-md">{ar.response}</p>
                  </div>
                </div>
                <Button
                  variant="ghost" size="icon"
                  className="text-muted-foreground/40 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 flex-shrink-0 rounded-xl"
                  onClick={() => onDelete(ar.id)}
                  disabled={remove.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="py-20 text-center rounded-3xl border border-dashed border-white/[0.06] bg-white/[0.01] animate-fade-in">
            <Bot className="w-14 h-14 mx-auto mb-4 text-muted-foreground/15" />
            <p className="text-muted-foreground/30 text-sm">{t("noAutoResponses")}</p>
            <p className="text-muted-foreground/20 text-xs mt-1">{t("noAutoResponsesHint")}</p>
          </div>
        )}
      </Stagger>
    </div>
  );
}
