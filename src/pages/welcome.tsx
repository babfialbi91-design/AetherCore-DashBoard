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
import { UserPlus, Save } from "lucide-react";

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

export default function Welcome() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();

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
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t("welcomeImageDesc")}</p>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
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

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-lg">{t("welcomeAvatarPos")}</CardTitle>
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
                  <CardTitle className="text-lg">{t("welcomeNamePos")}</CardTitle>
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
