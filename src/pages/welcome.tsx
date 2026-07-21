import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { UserPlus, Save, Upload, Circle, Square, Trash2 } from "lucide-react";

type Channel = { id: string; name: string; type: number };

type WelcomeConfig = {
  channelId: string;
  messageTemplate: string;
  imageUrl: string;
  avatarX: number;
  avatarY: number;
  avatarRadius: number;
  nameX: number;
  nameY: number;
  nameWidth: number;
  nameHeight: number;
};

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) msg += ` - ${body.error}`;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

const welcomeSchema = z.object({
  channelId: z.string().min(1, "Channel is required"),
  messageTemplate: z.string().min(1, "Message template is required"),
  imageUrl: z.string().optional(),
  avatarX: z.coerce.number().min(0),
  avatarY: z.coerce.number().min(0),
  avatarRadius: z.coerce.number().min(5),
  nameX: z.coerce.number().min(0),
  nameY: z.coerce.number().min(0),
  nameWidth: z.coerce.number().min(10),
  nameHeight: z.coerce.number().min(10),
});

type WelcomeFormValues = z.infer<typeof welcomeSchema>;

const PREVIEW_W = 800;
const PREVIEW_H = 400;

type DragMode = { type: "move"; el: "avatar" | "name"; offsetX: number; offsetY: number } | { type: "resize"; el: "avatar" | "name"; edge: string; startX: number; startY: number; origX: number; origY: number; origW: number; origH: number } | null;

export default function Welcome() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragMode>(null);

  const { data: config, isLoading } = useQuery({
    queryKey: ["welcome-config"],
    queryFn: () => apiCall<WelcomeConfig>("/api/bot/welcome/config"),
  });

  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ["channels"],
    queryFn: () => apiCall<Channel[]>("/api/bot/channels"),
  });

  const saveConfig = useMutation({
    mutationFn: (data: WelcomeFormValues) =>
      apiCall("/api/bot/welcome/config", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({ title: t("configSaved") });
      queryClient.invalidateQueries({ queryKey: ["welcome-config"] });
    },
    onError: (err: Error) => toast({ title: t("error"), description: err.message, variant: "destructive" }),
  });

  const form = useForm<WelcomeFormValues>({
    resolver: zodResolver(welcomeSchema),
    defaultValues: {
      channelId: "",
      messageTemplate: "Welcome to {server}, {user}!",
      imageUrl: "",
      avatarX: 320,
      avatarY: 40,
      avatarRadius: 80,
      nameX: 200,
      nameY: 220,
      nameWidth: 400,
      nameHeight: 60,
    },
  });

  useEffect(() => {
    if (config && !form.formState.isDirty) {
      form.reset({
        channelId: config.channelId || "",
        messageTemplate: config.messageTemplate || "",
        imageUrl: config.imageUrl || "",
        avatarX: config.avatarX ?? 320,
        avatarY: config.avatarY ?? 40,
        avatarRadius: config.avatarRadius ?? 80,
        nameX: config.nameX ?? 200,
        nameY: config.nameY ?? 220,
        nameWidth: config.nameWidth ?? 400,
        nameHeight: config.nameHeight ?? 60,
      });
    }
  }, [config]);

  const vals = form.watch();

  const fromPreview = useCallback((clientX: number, clientY: number) => {
    if (!previewRef.current) return { x: 0, y: 0 };
    const rect = previewRef.current.getBoundingClientRect();
    return {
      x: Math.round(((clientX - rect.left) / rect.width) * PREVIEW_W),
      y: Math.round(((clientY - rect.top) / rect.height) * PREVIEW_H),
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      form.setValue("imageUrl", reader.result as string, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const handleMoveStart = (el: "avatar" | "name") => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = fromPreview(e.clientX, e.clientY);
    const fieldX = el === "avatar" ? vals.avatarX : vals.nameX;
    const fieldY = el === "avatar" ? vals.avatarY : vals.nameY;
    setDrag({ type: "move", el, offsetX: pos.x - fieldX, offsetY: pos.y - fieldY });
  };

  const handleResizeStart = (el: "avatar" | "name", edge: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = fromPreview(e.clientX, e.clientY);
    setDrag({
      type: "resize",
      el,
      edge,
      startX: pos.x,
      startY: pos.y,
      origX: el === "avatar" ? vals.avatarX : vals.nameX,
      origY: el === "avatar" ? vals.avatarY : vals.nameY,
      origW: el === "avatar" ? vals.avatarRadius * 2 : vals.nameWidth,
      origH: el === "avatar" ? vals.avatarRadius * 2 : vals.nameHeight,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!drag || !previewRef.current) return;
    const pos = fromPreview(e.clientX, e.clientY);

    if (drag.type === "move") {
      const w = drag.el === "avatar" ? vals.avatarRadius * 2 : vals.nameWidth;
      const h = drag.el === "avatar" ? vals.avatarRadius * 2 : vals.nameHeight;
      const newX = Math.max(0, Math.min(PREVIEW_W - w, pos.x - drag.offsetX));
      const newY = Math.max(0, Math.min(PREVIEW_H - h, pos.y - drag.offsetY));
      if (drag.el === "avatar") {
        form.setValue("avatarX", newX, { shouldDirty: true });
        form.setValue("avatarY", newY, { shouldDirty: true });
      } else {
        form.setValue("nameX", newX, { shouldDirty: true });
        form.setValue("nameY", newY, { shouldDirty: true });
      }
    } else if (drag.type === "resize") {
      const dx = pos.x - drag.startX;
      const dy = pos.y - drag.startY;
      const edge = drag.edge;

      if (drag.el === "avatar") {
        let newR = vals.avatarRadius;
        if (edge.includes("right") || edge.includes("left")) {
          newR = Math.max(15, Math.round((drag.origW + dx) / 2));
        } else if (edge.includes("bottom") || edge.includes("top")) {
          newR = Math.max(15, Math.round((drag.origH + dy) / 2));
        }
        form.setValue("avatarRadius", newR, { shouldDirty: true });
      } else {
        let newW = vals.nameWidth;
        let newH = vals.nameHeight;
        if (edge.includes("right")) newW = Math.max(30, drag.origW + dx);
        if (edge.includes("left")) {
          newW = Math.max(30, drag.origW - dx);
          form.setValue("nameX", drag.origX + dx, { shouldDirty: true });
        }
        if (edge.includes("bottom")) newH = Math.max(20, drag.origH + dy);
        if (edge.includes("top")) {
          newH = Math.max(20, drag.origH - dy);
          form.setValue("nameY", drag.origY + dy, { shouldDirty: true });
        }
        form.setValue("nameWidth", Math.round(newW), { shouldDirty: true });
        form.setValue("nameHeight", Math.round(newH), { shouldDirty: true });
      }
    }
  }, [drag, vals.avatarRadius, vals.nameWidth, vals.nameHeight, fromPreview, form]);

  const handleMouseUp = useCallback(() => {
    setDrag(null);
  }, []);

  useEffect(() => {
    if (drag) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [drag, handleMouseMove, handleMouseUp]);

  const avatarL = (vals.avatarX / PREVIEW_W) * 100;
  const avatarT = (vals.avatarY / PREVIEW_H) * 100;
  const avatarWPct = (vals.avatarRadius * 2 / PREVIEW_W) * 100;
  const avatarHPct = (vals.avatarRadius * 2 / PREVIEW_H) * 100;
  const nameL = (vals.nameX / PREVIEW_W) * 100;
  const nameT = (vals.nameY / PREVIEW_H) * 100;
  const nameWPct = (vals.nameWidth / PREVIEW_W) * 100;
  const nameHPct = (vals.nameHeight / PREVIEW_H) * 100;

  const handleSize = 10;

  const renderResizeHandles = (el: "avatar" | "name", w: number, h: number) => {
    const handles = [
      { edge: "right", style: { position: "absolute" as const, right: -handleSize / 2, top: "50%", transform: "translateY(-50%)", width: handleSize, height: handleSize, background: el === "avatar" ? "#a78bfa" : "#60a5fa", borderRadius: 2, cursor: "ew-resize", zIndex: 30 } },
      { edge: "bottom", style: { position: "absolute" as const, bottom: -handleSize / 2, left: "50%", transform: "translateX(-50%)", width: handleSize, height: handleSize, background: el === "avatar" ? "#a78bfa" : "#60a5fa", borderRadius: 2, cursor: "ns-resize", zIndex: 30 } },
      { edge: "bottom-right", style: { position: "absolute" as const, right: -handleSize / 2, bottom: -handleSize / 2, width: handleSize, height: handleSize, background: el === "avatar" ? "#a78bfa" : "#60a5fa", borderRadius: 2, cursor: "nwse-resize", zIndex: 30 } },
    ];
    return handles.map((h) => (
      <div
        key={h.edge}
        style={h.style}
        onMouseDown={handleResizeStart(el, h.edge)}
      />
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-primary" />
          {t("welcomeTitle")}
        </h2>
        <p className="text-muted-foreground mt-2">{t("welcomeDesc")}</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => saveConfig.mutate(values))}
            className="space-y-6"
          >
            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary" />
                  {t("welcomeChannel")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="channelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("welcomeChannel")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50 max-w-sm" data-testid="select-welcome-channel">
                            <SelectValue placeholder={channelsLoading ? t("loadingChannels") : t("selectChannel")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {channels?.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id} data-testid={`option-channel-${ch.id}`}>
                              # {ch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-lg">{t("welcomeTemplate")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("welcomeTemplateDesc")}</p>
                <FormField
                  control={form.control}
                  name="messageTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={t("welcomeTemplatePlaceholder")}
                          className="bg-background/50 resize-none min-h-[100px]"
                          {...field}
                          data-testid="textarea-welcome-template"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-lg">{t("welcomeImageUrl")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("welcomeImageDesc")}</p>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {t("welcomeUploadImage") || "Upload Image"}
                  </Button>
                  {vals.imageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => form.setValue("imageUrl", "", { shouldDirty: true })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Or paste image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.png"
                          {...field}
                          data-testid="input-welcome-image"
                          className="bg-background/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-lg">{t("welcomePreview") || "Card Preview"}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("welcomePreviewDesc") || "Drag to move. Drag the small squares on edges to resize."}
                </p>
              </CardHeader>
              <CardContent>
                <div
                  ref={previewRef}
                  className="relative w-full bg-black/40 rounded-xl border border-white/10 select-none"
                  style={{ aspectRatio: `${PREVIEW_W}/${PREVIEW_H}`, minHeight: "250px" }}
                >
                  {vals.imageUrl ? (
                    <img
                      src={vals.imageUrl}
                      alt="Welcome card"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10" />
                  )}

                  <div
                    style={{
                      position: "absolute",
                      left: `${avatarL}%`,
                      top: `${avatarT}%`,
                      width: `${avatarWPct}%`,
                      height: `${avatarHPct}%`,
                      borderRadius: "50%",
                      border: "3px dashed #a78bfa",
                      background: "rgba(167, 139, 250, 0.2)",
                      cursor: drag?.type === "move" && drag.el === "avatar" ? "grabbing" : "grab",
                      zIndex: drag?.el === "avatar" ? 20 : 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: drag?.el === "avatar" ? "0 0 0 3px rgba(167,139,250,0.5)" : "none",
                    }}
                    onMouseDown={handleMoveStart("avatar")}
                  >
                    <Circle className="w-8 h-8 text-primary opacity-60" />
                    {renderResizeHandles("avatar", vals.avatarRadius * 2, vals.avatarRadius * 2)}
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      left: `${nameL}%`,
                      top: `${nameT}%`,
                      width: `${nameWPct}%`,
                      height: `${nameHPct}%`,
                      borderRadius: "8px",
                      border: "3px dashed #60a5fa",
                      background: "rgba(96, 165, 250, 0.2)",
                      cursor: drag?.type === "move" && drag.el === "name" ? "grabbing" : "grab",
                      zIndex: drag?.el === "name" ? 20 : 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: drag?.el === "name" ? "0 0 0 3px rgba(96,165,250,0.5)" : "none",
                    }}
                    onMouseDown={handleMoveStart("name")}
                  >
                    <span className="text-sm font-mono text-blue-300 opacity-70 select-none">Username</span>
                    {renderResizeHandles("name", vals.nameWidth, vals.nameHeight)}
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-purple-400 inline-block" /> Avatar (drag to move)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-blue-400 inline-block" /> Name (drag to move)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-400 rounded-sm inline-block" /> Edge handle (drag to resize)</span>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={saveConfig.isPending}
              data-testid="button-welcome-save"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveConfig.isPending ? t("saving") : t("welcomeSave")}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
