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
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const welcomeSchema = z.object({
  channelId: z.string().min(1, "Channel is required"),
  messageTemplate: z.string().min(1, "Message template is required"),
  imageUrl: z.string().optional(),
  avatarX: z.coerce.number().min(0),
  avatarY: z.coerce.number().min(0),
  avatarRadius: z.coerce.number().min(1),
  nameX: z.coerce.number().min(0),
  nameY: z.coerce.number().min(0),
  nameWidth: z.coerce.number().min(1),
  nameHeight: z.coerce.number().min(1),
});

type WelcomeFormValues = z.infer<typeof welcomeSchema>;

const PREVIEW_W = 800;
const PREVIEW_H = 400;

export default function Welcome() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"avatar" | "name" | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  const form = useForm<WelcomeFormValues>({
    resolver: zodResolver(welcomeSchema),
    defaultValues: {
      channelId: "",
      messageTemplate: "Welcome to {server}, {user}!",
      imageUrl: "",
      avatarX: 50,
      avatarY: 50,
      avatarRadius: 60,
      nameX: 50,
      nameY: 130,
      nameWidth: 300,
      nameHeight: 50,
    },
  });

  useEffect(() => {
    if (config && !form.formState.isDirty) {
      form.reset({
        channelId: config.channelId || "",
        messageTemplate: config.messageTemplate || "",
        imageUrl: config.imageUrl || "",
        avatarX: config.avatarX ?? 50,
        avatarY: config.avatarY ?? 50,
        avatarRadius: config.avatarRadius ?? 60,
        nameX: config.nameX ?? 50,
        nameY: config.nameY ?? 130,
        nameWidth: config.nameWidth ?? 300,
        nameHeight: config.nameHeight ?? 50,
      });
    }
  }, [config]);

  const vals = form.watch();

  const toPreview = useCallback((px: number, py: number) => {
    if (!previewRef.current) return { x: 0, y: 0 };
    const rect = previewRef.current.getBoundingClientRect();
    return {
      x: (px / PREVIEW_W) * rect.width,
      y: (py / PREVIEW_H) * rect.height,
    };
  }, []);

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

  const handleMouseDown = (el: "avatar" | "name") => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(el);
    const pos = fromPreview(e.clientX, e.clientY);
    const fieldX = el === "avatar" ? vals.avatarX : vals.nameX;
    const fieldY = el === "avatar" ? vals.avatarY : vals.nameY;
    setDragOffset({ x: pos.x - fieldX, y: pos.y - fieldY });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !previewRef.current) return;
    const pos = fromPreview(e.clientX, e.clientY);
    const newX = Math.max(0, Math.min(PREVIEW_W - (dragging === "avatar" ? vals.avatarRadius * 2 : vals.nameWidth), pos.x - dragOffset.x));
    const newY = Math.max(0, Math.min(PREVIEW_H - (dragging === "avatar" ? vals.avatarRadius * 2 : vals.nameHeight), pos.y - dragOffset.y));
    if (dragging === "avatar") {
      form.setValue("avatarX", newX, { shouldDirty: true });
      form.setValue("avatarY", newY, { shouldDirty: true });
    } else {
      form.setValue("nameX", newX, { shouldDirty: true });
      form.setValue("nameY", newY, { shouldDirty: true });
    }
  }, [dragging, dragOffset, vals.avatarRadius, vals.nameWidth, vals.nameHeight, fromPreview, form]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const avatarStyle: React.CSSProperties = {
    position: "absolute",
    left: `${(vals.avatarX / PREVIEW_W) * 100}%`,
    top: `${(vals.avatarY / PREVIEW_H) * 100}%`,
    width: `${(vals.avatarRadius * 2 / PREVIEW_W) * 100}%`,
    height: `${(vals.avatarRadius * 2 / PREVIEW_H) * 100}%`,
    borderRadius: "50%",
    border: "3px dashed #a78bfa",
    background: "rgba(167, 139, 250, 0.2)",
    cursor: "grab",
    zIndex: dragging === "avatar" ? 20 : 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: dragging === "avatar" ? "none" : "box-shadow 0.2s",
    boxShadow: dragging === "avatar" ? "0 0 0 3px rgba(167,139,250,0.5)" : "none",
  };

  const nameStyle: React.CSSProperties = {
    position: "absolute",
    left: `${(vals.nameX / PREVIEW_W) * 100}%`,
    top: `${(vals.nameY / PREVIEW_H) * 100}%`,
    width: `${(vals.nameWidth / PREVIEW_W) * 100}%`,
    height: `${(vals.nameHeight / PREVIEW_H) * 100}%`,
    borderRadius: "8px",
    border: "3px dashed #60a5fa",
    background: "rgba(96, 165, 250, 0.2)",
    cursor: "grab",
    zIndex: dragging === "name" ? 20 : 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: dragging === "name" ? "none" : "box-shadow 0.2s",
    boxShadow: dragging === "name" ? "0 0 0 3px rgba(96,165,250,0.5)" : "none",
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
                  {t("welcomePreviewDesc") || "Drag the circle (avatar) and rectangle (name) to position them"}
                </p>
              </CardHeader>
              <CardContent>
                <div
                  ref={previewRef}
                  className="relative w-full bg-black/40 rounded-xl border border-white/10 select-none"
                  style={{ aspectRatio: `${PREVIEW_W}/${PREVIEW_H}`, minHeight: "200px" }}
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
                    style={avatarStyle}
                    onMouseDown={handleMouseDown("avatar")}
                  >
                    <Circle className="w-6 h-6 text-primary opacity-50" />
                  </div>

                  <div
                    style={nameStyle}
                    onMouseDown={handleMouseDown("name")}
                  >
                    <span className="text-xs font-mono text-blue-400 opacity-60">Username</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-primary inline-block" /> Avatar</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-blue-500 inline-block" /> Name</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Circle className="w-4 h-4 text-primary" />
                    {t("welcomeAvatarPos")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="avatarX"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>X</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="avatarY"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Y</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="avatarRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("radius")}</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Square className="w-4 h-4 text-blue-500" />
                    {t("welcomeNamePos")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nameX"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>X</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nameY"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Y</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nameWidth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nameHeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

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
