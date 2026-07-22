import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, Clock, ShieldAlert, Plus, Shield, ChevronDown, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    mutationFn: (data: { userId: string; reason: string }) =>
      apiCall<{ ok: boolean; warnCount?: number; error?: string }>("/api/bot/warnings", { method: "POST", body: JSON.stringify(data) }),
  });

  const form = useForm<WarnValues>({ resolver: zodResolver(warnSchema), defaultValues: { userId: "", reason: "" } });

  function onSubmit(values: WarnValues) {
    createWarning.mutate(
      { userId: values.userId, reason: values.reason },
      {
        onSuccess: (res) => {
          if (res.ok) {
            toast({ title: `Warning issued (total: ${res.warnCount ?? 1})` });
            form.reset();
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ["warnings"] });
          } else toast({ title: res.error || "Failed", variant: "destructive" });
        },
        onError: () => toast({ title: "Failed", variant: "destructive" }),
      }
    );
  }

  const totalCount = userWarnings ? userWarnings.reduce((sum: number, r: any) => sum + (r.warnings?.length ?? 0), 0) : 0;
  const isDanger = totalCount > 10;

  return (
    <div className="space-y-8">
      <PageTransition>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose/20 to-rose/5 border border-rose/20 flex items-center justify-center glow-magenta">
              <ShieldAlert className="w-7 h-7 text-rose" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gradient-magenta">{t("warningsTitle")}</h2>
              <p className="text-muted-foreground/40 text-sm mt-0.5">{t("warningsDesc")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-4xl font-black font-mono text-rose">{totalCount}</p>
              <p className="text-[10px] text-muted-foreground/30 uppercase tracking-wider font-bold">Total Warnings</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isDanger ? "bg-rose animate-pulse-neon" : "bg-emerald"}`} />
          </div>
        </div>
      </PageTransition>

      <PageTransition delay={50}>
        <div className="rounded-3xl border border-white/[0.06] overflow-hidden">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="w-full flex items-center justify-between p-5 bg-white/[0.02] hover:bg-white/[0.03] transition-colors border-b border-white/[0.04]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose/10 border border-rose/20 flex items-center justify-center">
                <Plus className={`w-4 h-4 text-rose transition-transform duration-300 ${showForm ? "rotate-45" : ""}`} />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground/40">{t("issueNewWarning")}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground/30 transition-transform duration-300 ${showForm ? "rotate-180" : ""}`} />
          </button>

          {showForm && (
            <div className="p-6 bg-white/[0.01] animate-slide-up">
              <GlowCard color="red">
                <div className="rounded-2xl border border-rose/10 bg-rose/[0.02] p-5">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="userId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] text-muted-foreground/40 uppercase tracking-wider font-bold">{t("discordUserId")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("userIdPlaceholder")} {...field} className="font-mono bg-white/[0.03] border-white/[0.06]" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] text-muted-foreground/40 uppercase tracking-wider font-bold">{t("reason")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("reasonPlaceholder")} {...field} className="bg-white/[0.03] border-white/[0.06]" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          disabled={createWarning.isPending}
                          className="bg-rose/15 hover:bg-rose/20 text-rose border border-rose/20 font-bold text-xs uppercase tracking-wider"
                        >
                          {createWarning.isPending ? t("issuing") : t("issueWarning")}
                        </Button>
                        <Button variant="outline" type="button" onClick={() => setShowForm(false)} className="border-white/[0.06]">
                          {t("cancel")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </GlowCard>
            </div>
          )}
        </div>
      </PageTransition>

      <PageTransition delay={100}>
        <div className="rounded-3xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : userWarnings && userWarnings.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {userWarnings.map((record) => (
                <AccordionItem
                  value={record.userId || record.id}
                  key={record.userId || record.id}
                  className="border-b border-white/[0.04] last:border-b-0"
                >
                  <AccordionTrigger className="hover:no-underline py-4 px-6 hover:bg-white/[0.015] transition-colors">
                    <div className="flex items-center gap-4 text-left">
                      <div className="relative">
                        <Avatar className="w-10 h-10 border-2 border-rose/20">
                          <AvatarImage src={record.avatar || undefined} />
                          <AvatarFallback className="bg-rose/10 text-rose text-xs">
                            <ShieldAlert className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose/20 border-2 border-background flex items-center justify-center">
                          <span className="text-[7px] font-black text-rose">{record.warnings?.length ?? 0}</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-sm">{record.username || record.userTag || "Unknown"}</div>
                        <div className="text-[10px] text-muted-foreground/30 font-mono">{record.userId || record.id}</div>
                      </div>
                      <Badge variant="destructive" className="ml-3 font-mono text-[10px]">
                        {record.warnings?.length ?? 0} {t("warningCount")}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 px-6">
                    <div className="space-y-3 mt-2 ml-14 border-l-2 border-rose/20 pl-5">
                      {(record.warnings ?? []).map((warning: any, idx: number) => (
                        <div
                          key={idx}
                          className="relative bg-white/[0.02] p-4 rounded-2xl border border-white/[0.04] border-l-2 border-l-rose/40 animate-fade-in"
                          style={{ animationDelay: `${idx * 80}ms` }}
                        >
                          <div className="absolute w-3 h-[2px] bg-rose/30 -left-[1.1rem] top-1/2 -translate-y-1/2" />
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-foreground/80">{warning.reason}</span>
                            <span className="text-[10px] text-muted-foreground/30 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {warning.timestamp != null ? format(new Date(warning.timestamp), "MMM d, HH:mm") : "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground/30">{t("moderator")}</span>
                            <Badge variant="outline" className="bg-rose/[0.04] border-rose/10 text-rose/60 font-mono text-[9px]">
                              {warning.moderatorTag}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="py-24 text-center">
              <div className="w-24 h-24 rounded-3xl bg-emerald/[0.06] border border-emerald/10 flex items-center justify-center mx-auto mb-6 glow-cyan">
                <ShieldCheck className="w-12 h-12 text-emerald" />
              </div>
              <p className="text-xl font-bold text-emerald uppercase tracking-wider">All Clear</p>
              <p className="text-xs text-muted-foreground/20 mt-2">{t("noWarnings")}</p>
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
