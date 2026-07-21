import { useState } from "react";
import {
  useGetBotAutoResponses,
  useCreateBotAutoResponse,
  useDeleteBotAutoResponse,
  getGetBotAutoResponsesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Bot, Plus, Zap, Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const schema = z.object({
  trigger: z.string().min(1, "Trigger is required"),
  response: z.string().min(1, "Response is required"),
  embedTitle: z.string().optional(),
  embedColor: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AutoResponses() {
  const { data, isLoading } = useGetBotAutoResponses();
  const create = useCreateBotAutoResponse();
  const remove = useDeleteBotAutoResponse();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const { t } = useLanguage();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { trigger: "", response: "", embedTitle: "", embedColor: "" },
  });

  function onSubmit(values: FormValues) {
    create.mutate(
      {
        data: {
          trigger: values.trigger,
          response: values.response,
          embedTitle: values.embedTitle || null,
          embedColor: values.embedColor || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Auto-response added" });
          form.reset();
          setShowForm(false);
          queryClient.invalidateQueries({ queryKey: getGetBotAutoResponsesQueryKey() });
        },
        onError: () => toast({ title: "Failed to add auto-response", variant: "destructive" }),
      }
    );
  }

  function onDelete(id: string | null | undefined) {
    if (!id) return;
    remove.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Auto-response removed" });
          queryClient.invalidateQueries({ queryKey: getGetBotAutoResponsesQueryKey() });
        },
        onError: () => toast({ title: "Failed to remove", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("autoResponsesTitle")}</h2>
          <p className="text-muted-foreground mt-2">{t("autoResponsesDesc")}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} data-testid="button-toggle-form">
          <Plus className="w-4 h-4 mr-2" />
          {t("addResponse")}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              {t("newAutoResponse")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="trigger"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("triggerKeyword")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("triggerPlaceholder")}
                            {...field}
                            data-testid="input-trigger"
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="embedTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("embedTitle")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("embedTitlePlaceholder")}
                            {...field}
                            data-testid="input-embed-title"
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="response"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("responseText")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("responsePlaceholder")}
                          {...field}
                          data-testid="input-response"
                          className="bg-background/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <Button type="submit" disabled={create.isPending} data-testid="button-submit-response">
                    {create.isPending ? t("saving") : t("saveResponse")}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => { setShowForm(false); form.reset(); }}
                    data-testid="button-cancel"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : data && data.length > 0 ? (
          data.map((ar, i) => (
            <Card
              key={ar.id ?? i}
              className="bg-card/50 border-white/5 hover:border-primary/30 transition-colors"
              data-testid={`card-autoresponse-${i}`}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="font-mono text-sm bg-primary/10 text-primary px-2 py-0.5 rounded"
                          data-testid={`text-trigger-${i}`}
                        >
                          {ar.trigger}
                        </span>
                        {ar.embedTitle && (
                          <span className="text-xs text-muted-foreground italic">{ar.embedTitle}</span>
                        )}
                      </div>
                      <p
                        className="text-sm text-muted-foreground truncate"
                        data-testid={`text-response-${i}`}
                      >
                        {ar.response}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={() => onDelete(ar.id)}
                    disabled={remove.isPending}
                    data-testid={`button-delete-${i}`}
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
              <Bot className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>{t("noAutoResponses")}</p>
              <p className="text-sm mt-1">{t("noAutoResponsesHint")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
