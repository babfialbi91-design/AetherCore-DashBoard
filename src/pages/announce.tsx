import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Send } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { PageTransition, GlowCard } from "@/components/page-transitions";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const schema = z.object({ channelId: z.string().min(1, "Select a channel"), message: z.string().min(1, "Message cannot be empty").max(2000, "Max 2000 characters") });
type FormValues = z.infer<typeof schema>;

export default function Announce() {
  const { data: channels, isLoading: channelsLoading } = useQuery({ queryKey: ["channels"], queryFn: () => apiCall<{ id: string; name: string; type: string }[]>("/api/bot/channels") });
  const { toast } = useToast();
  const { t } = useLanguage();

  const send = useMutation({
    mutationFn: (data: { channelId: string; message: string }) => apiCall<{ ok: boolean; error?: string }>("/api/bot/announce", { method: "POST", body: JSON.stringify(data) }),
  });

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { channelId: "", message: "" } });
  const messageVal = form.watch("message");

  function onSubmit(values: FormValues) {
    send.mutate({ channelId: values.channelId, message: values.message }, {
      onSuccess: (res) => { if (res.ok) { toast({ title: "Announcement sent" }); form.reset(); } else toast({ title: res.error || "Failed", variant: "destructive" }); },
      onError: () => toast({ title: "Failed", variant: "destructive" }),
    });
  }

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-cyan" /> {t("announceTitle")}
          </h2>
          <p className="text-muted-foreground/60 mt-2 text-sm">{t("announceDesc")}</p>
        </div>
      </PageTransition>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <PageTransition delay={100}>
            <GlowCard color="cyan">
              <Card className="border-0 bg-transparent">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Megaphone className="w-4 h-4 text-cyan" />{t("composeAnnounce")}</CardTitle></CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField control={form.control} name="channelId" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("targetChannel")}</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={channelsLoading ? t("loadingChannels") : t("selectChannel")} /></SelectTrigger></FormControl><SelectContent className="max-h-60 overflow-y-auto">{channels?.map((ch) => (<SelectItem key={ch.id} value={ch.id}># {ch.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="message" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs text-muted-foreground/50">{t("message")}</FormLabel><FormControl><Textarea placeholder={t("messagePlaceholder")} className="min-h-[160px] resize-none" {...field} /></FormControl><div className="flex justify-between items-center mt-1"><FormMessage /><span className={`text-xs ml-auto ${messageVal.length > 1800 ? "text-red-400" : "text-muted-foreground/30"}`}>{messageVal.length} / 2000</span></div></FormItem>
                      )} />
                      <Button type="submit" disabled={send.isPending} className="w-full"><Send className="w-4 h-4 mr-2" />{send.isPending ? t("sending") : t("sendAnnounce")}</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </GlowCard>
          </PageTransition>
        </div>

        <div className="space-y-4">
          <PageTransition delay={200}>
            <Card>
              <CardHeader><CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">{t("tips")}</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground/50">
                <p>{t("tipsMarkdown")}</p>
                <div className="space-y-1 font-mono text-xs bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">
                  <p><span className="text-cyan">**bold**</span> — {t("bold")}</p>
                  <p><span className="text-cyan">*italic*</span> — {t("italic")}</p>
                  <p><span className="text-cyan">`code`</span> — {t("code")}</p>
                  <p><span className="text-cyan">@everyone</span> — {t("pingAll")}</p>
                </div>
                <p>{t("maxChars")}</p>
              </CardContent>
            </Card>
          </PageTransition>

          <PageTransition delay={300}>
            <Card>
              <CardHeader><CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">{t("availableChannels")}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {channelsLoading ? <p className="text-sm text-muted-foreground/40">{t("loading")}</p> : channels?.map((ch) => (
                    <div key={ch.id} className="text-sm text-muted-foreground/50 py-1 flex items-center gap-2"><span className="text-cyan">#</span>{ch.name}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </PageTransition>
        </div>
      </div>
    </div>
  );
}
