import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, Clock, ShieldAlert, Plus, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLanguage } from "@/hooks/use-language";
import { PageTransition, GlowCard } from "@/components/page-transitions";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const warnSchema = z.object({ userId: z.string().min(1), reason: z.string().min(1) });
type WarnValues = z.infer<typeof warnSchema>;

export default function Warnings() {
  const { data: userWarnings, isLoading } = useQuery({ queryKey: ["warnings"], queryFn: () => apiCall<any[]>("/api/bot/warnings") });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const { t } = useLanguage();

  const createWarning = useMutation({
    mutationFn: (data: { userId: string; reason: string }) => apiCall<{ ok: boolean; warnCount?: number; error?: string }>("/api/bot/warnings", { method: "POST", body: JSON.stringify(data) }),
  });

  const form = useForm<WarnValues>({ resolver: zodResolver(warnSchema), defaultValues: { userId: "", reason: "" } });

  function onSubmit(values: WarnValues) {
    createWarning.mutate({ userId: values.userId, reason: values.reason }, {
      onSuccess: (res) => {
        if (res.ok) { toast({ title: `Warning issued (total: ${res.warnCount ?? 1})` }); form.reset(); setShowForm(false); queryClient.invalidateQueries({ queryKey: ["warnings"] }); }
        else toast({ title: res.error || "Failed", variant: "destructive" });
      },
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-pink flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400" /> {t("warningsTitle")}
            </h2>
            <p className="text-muted-foreground/60 mt-2 text-sm">{t("warningsDesc")}</p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)} variant="destructive"><Plus className="w-4 h-4 mr-2" />{t("issueWarning")}</Button>
        </div>
      </PageTransition>

      {showForm && (
        <PageTransition>
          <GlowCard color="red">
            <Card className="border-0 bg-transparent">
              <CardHeader><CardTitle className="text-base flex items-center gap-2 text-red-400"><Shield className="w-4 h-4" />{t("issueNewWarning")}</CardTitle></CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField control={form.control} name="userId" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("discordUserId")}</FormLabel><FormControl><Input placeholder={t("userIdPlaceholder")} {...field} className="font-mono" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="reason" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("reason")}</FormLabel><FormControl><Input placeholder={t("reasonPlaceholder")} {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" variant="destructive" disabled={createWarning.isPending}>{createWarning.isPending ? t("issuing") : t("issueWarning")}</Button>
                      <Button variant="outline" type="button" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </GlowCard>
        </PageTransition>
      )}

      <PageTransition delay={100}>
        <div className="rounded-2xl overflow-hidden border border-white/[0.05] bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
          {isLoading ? <div className="p-6 space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div> :
          userWarnings && userWarnings.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {userWarnings.map((record) => (
                <AccordionItem value={record.userId || record.id} key={record.userId || record.id} className="border-white/[0.04] px-6">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 text-left">
                      <Avatar className="w-9 h-9 border border-white/[0.08]">
                        <AvatarImage src={record.avatar || undefined} />
                        <AvatarFallback className="bg-red-500/10 text-red-400 text-xs"><ShieldAlert className="w-4 h-4" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-sm">{record.username || record.userTag || "Unknown"}</div>
                        <div className="text-[10px] text-muted-foreground/30 font-mono">{record.userId || record.id}</div>
                      </div>
                      <Badge variant="destructive" className="ml-3 font-mono text-[10px]">{record.warnings?.length ?? 0} {t("warningCount")}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="space-y-2.5 mt-2 pl-12 border-l border-white/[0.04] ml-4">
                      {(record.warnings ?? []).map((warning: any, idx: number) => (
                        <div key={idx} className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.04] relative">
                          <div className="absolute w-3 h-[1px] bg-white/[0.06] -left-[0.85rem] top-1/2 -translate-y-1/2" />
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-medium text-sm">{warning.reason}</span>
                            <span className="text-[10px] text-muted-foreground/30 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />{warning.timestamp != null ? format(new Date(warning.timestamp), "MMM d, HH:mm") : "Unknown"}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground/30 flex items-center gap-2">
                            <span>{t("moderator")}</span>
                            <Badge variant="outline" className="bg-white/[0.03] border-white/[0.06] font-mono text-[9px]">{warning.moderatorTag}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="p-16 text-center text-muted-foreground/30">
              <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-20 text-green-400" /><p className="text-lg">{t("noWarnings")}</p>
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
