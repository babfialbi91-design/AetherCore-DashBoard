import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Palette, Send } from "lucide-react";
import { PageTransition, GlowCard } from "@/components/page-transitions";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

type Channel = { id: string; name: string; type: number };
type EmbedForm = { channelId: string; title: string; description: string; color: string; imageUrl: string; thumbnailUrl: string; footer: string };
const DEFAULT_FORM: EmbedForm = { channelId: "", title: "", description: "", color: "#5865F2", imageUrl: "", thumbnailUrl: "", footer: "" };

export default function EmbedBuilder() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [form, setForm] = useState<EmbedForm>(DEFAULT_FORM);
  const { data: channels, isLoading: channelsLoading } = useQuery({ queryKey: ["channels"], queryFn: () => apiCall<Channel[]>("/api/bot/channels") });

  const sendEmbed = useMutation({
    mutationFn: (body: Record<string, string | undefined>) => apiCall<{ ok: boolean }>("/api/bot/embed/send", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: t("embedSent") }); setForm(DEFAULT_FORM); },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  function updateField<K extends keyof EmbedForm>(field: K, value: EmbedForm[K]) { setForm((prev) => ({ ...prev, [field]: value })); }
  function handleSend() {
    const body: Record<string, string | undefined> = { channelId: form.channelId };
    if (form.title) body.title = form.title;
    if (form.description) body.description = form.description;
    if (form.color) body.color = form.color;
    if (form.imageUrl) body.imageUrl = form.imageUrl;
    if (form.thumbnailUrl) body.thumbnailUrl = form.thumbnailUrl;
    if (form.footer) body.footer = form.footer;
    sendEmbed.mutate(body);
  }

  const previewColor = /^#[0-9A-Fa-f]{6}$/.test(form.color) ? form.color : "#5865F2";

  return (
    <div className="space-y-8">
      <PageTransition>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient-cyber flex items-center gap-3">
            <Palette className="w-8 h-8 text-cyan" /> {t("embedTitle2")}
          </h2>
          <p className="text-muted-foreground/60 mt-2 text-sm">{t("embedDesc")}</p>
        </div>
      </PageTransition>

      <div className="grid gap-6 lg:grid-cols-2">
        <PageTransition delay={100}>
          <GlowCard color="cyan">
            <Card className="border-0 bg-transparent">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Palette className="w-4 h-4 text-cyan" />{t("embedTitle2")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider mb-1 block">{t("embedChannel")}</label>
                  {channelsLoading ? <Skeleton className="h-10 w-full" /> : (
                    <Select value={form.channelId} onValueChange={(val) => updateField("channelId", val)}>
                      <SelectTrigger><SelectValue placeholder={t("selectChannel")} /></SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">{channels?.map((ch) => (<SelectItem key={ch.id} value={ch.id}># {ch.name}</SelectItem>))}</SelectContent>
                    </Select>
                  )}
                </div>
                <div><label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider mb-1 block">{t("embedFieldTitle")}</label><Input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Embed title" /></div>
                <div><label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider mb-1 block">{t("embedFieldDesc")}</label><Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Embed description..." className="min-h-[100px] resize-none" /></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider mb-1 block">{t("embedFieldColor")}</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={previewColor} onChange={(e) => updateField("color", e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
                      <Input value={form.color} onChange={(e) => updateField("color", e.target.value)} placeholder="#5865F2" className="font-mono flex-1" />
                    </div>
                  </div>
                  <div><label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider mb-1 block">{t("embedFieldFooter")}</label><Input value={form.footer} onChange={(e) => updateField("footer", e.target.value)} placeholder="Footer text" /></div>
                </div>
                <div><label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider mb-1 block">{t("embedFieldImage")}</label><Input value={form.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} placeholder="https://example.com/image.png" /></div>
                <div><label className="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider mb-1 block">{t("embedFieldThumbnail")}</label><Input value={form.thumbnailUrl} onChange={(e) => updateField("thumbnailUrl", e.target.value)} placeholder="https://example.com/thumbnail.png" /></div>
                <Button onClick={handleSend} disabled={sendEmbed.isPending || !form.channelId}><Send className="w-4 h-4 mr-2" />{sendEmbed.isPending ? t("embedSending") : t("embedSend")}</Button>
              </CardContent>
            </Card>
          </GlowCard>
        </PageTransition>

        <PageTransition delay={200}>
          <Card>
            <CardHeader><CardTitle className="text-lg">{t("embedPreview")}</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border border-white/10 bg-[#2f3136] overflow-hidden" style={{ borderLeftWidth: "4px", borderLeftColor: previewColor }}>
                <div className="p-4">
                  {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="thumbnail" className="w-16 h-16 float-right rounded ml-4 mb-2 object-cover" />}
                  {form.title && <p className="font-semibold text-white mb-1">{form.title}</p>}
                  {form.description && <p className="text-sm text-gray-300 whitespace-pre-wrap">{form.description}</p>}
                  {form.imageUrl && <img src={form.imageUrl} alt="embed" className="mt-3 max-w-full rounded" />}
                </div>
                {form.footer && <div className="px-4 py-2 border-t border-white/5"><p className="text-xs text-gray-400">{form.footer}</p></div>}
              </div>
              {!form.title && !form.description && !form.footer && <p className="text-sm text-muted-foreground/30 mt-4 text-center">{t("embedPreview")}</p>}
            </CardContent>
          </Card>
        </PageTransition>
      </div>
    </div>
  );
}
