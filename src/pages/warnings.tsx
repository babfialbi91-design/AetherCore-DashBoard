import { useState } from "react";
import { useGetBotWarnings, useCreateBotWarning, getGetBotWarningsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, Clock, ShieldAlert, Plus, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLanguage } from "@/hooks/use-language";

const warnSchema = z.object({
  userId: z.string().min(1, "Discord User ID is required"),
  reason: z.string().min(1, "Reason is required"),
});

type WarnValues = z.infer<typeof warnSchema>;

export default function Warnings() {
  const { data: userWarnings, isLoading } = useGetBotWarnings();
  const createWarning = useCreateBotWarning();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const { t } = useLanguage();

  const form = useForm<WarnValues>({
    resolver: zodResolver(warnSchema),
    defaultValues: { userId: "", reason: "" },
  });

  function onSubmit(values: WarnValues) {
    createWarning.mutate(
      { data: { userId: values.userId, reason: values.reason } },
      {
        onSuccess: (res) => {
          if (res.ok) {
            toast({ title: `Warning issued (total: ${res.warnCount ?? 1})` });
            form.reset();
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: getGetBotWarningsQueryKey() });
          } else {
            toast({ title: res.error || "Failed to issue warning", variant: "destructive" });
          }
        },
        onError: () => toast({ title: "Failed to issue warning", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            {t("warningsTitle")}
          </h2>
          <p className="text-muted-foreground mt-2">{t("warningsDesc")}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} variant="destructive" data-testid="button-toggle-warn-form">
          <Plus className="w-4 h-4 mr-2" />
          {t("issueWarning")}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card/50 border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <Shield className="w-4 h-4" />
              {t("issueNewWarning")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("discordUserId")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("userIdPlaceholder")}
                            {...field}
                            data-testid="input-warn-userid"
                            className="bg-background/50 font-mono"
                          />
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
                        <FormLabel>{t("reason")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("reasonPlaceholder")}
                            {...field}
                            data-testid="input-warn-reason"
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="destructive" disabled={createWarning.isPending} data-testid="button-submit-warning">
                    {createWarning.isPending ? t("issuing") : t("issueWarning")}
                  </Button>
                  <Button variant="outline" type="button" onClick={() => setShowForm(false)} data-testid="button-cancel-warn">
                    {t("cancel")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="bg-card/50 border border-white/5 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : userWarnings && userWarnings.length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {userWarnings.map((record) => (
              <AccordionItem value={record.userId} key={record.userId} className="border-white/5 px-6">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
                      <ShieldAlert className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{record.userTag}</div>
                      <div className="text-xs text-muted-foreground font-mono">{record.userId}</div>
                    </div>
                    <Badge variant="destructive" className="ml-4 font-mono">
                      {record.warnings?.length ?? 0} {(record.warnings?.length ?? 0) === 1 ? t("warning") : t("warningCount")}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="space-y-3 mt-2 pl-14 border-l-2 border-white/5 ml-5">
                    {(record.warnings ?? []).map((warning: any, idx: number) => (
                      <div key={idx} className="bg-black/30 p-4 rounded-lg border border-white/5 relative">
                        <div className="absolute w-4 h-[2px] bg-white/5 -left-[1.35rem] top-1/2 -translate-y-1/2" />
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-destructive-foreground">{warning.reason}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {warning.timestamp != null ? format(new Date(warning.timestamp), "MMM d, yyyy HH:mm") : "Unknown"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{t("moderator")}</span>
                          <Badge variant="outline" className="bg-white/5 border-white/10 font-mono text-[10px]">
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
          <div className="p-16 text-center text-muted-foreground">
            <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-20 text-green-500" />
            <p className="text-lg">{t("noWarnings")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
