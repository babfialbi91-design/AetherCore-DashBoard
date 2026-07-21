import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Ticket, Save, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function Tickets() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [openMessage, setOpenMessage] = useState("");

  const { data: openMsgData, isLoading: loadingOpenMsg } = useQuery({
    queryKey: ["ticket-open-message"],
    queryFn: () => apiCall<{ message: string }>("/api/bot/tickets/open-message"),
  });

  useEffect(() => {
    if (openMsgData?.message) {
      setOpenMessage(openMsgData.message);
    }
  }, [openMsgData]);

  const saveOpenMessage = useMutation({
    mutationFn: (message: string) =>
      apiCall("/api/bot/tickets/open-message", {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    onSuccess: () => {
      toast({ title: t("success") });
      queryClient.invalidateQueries({ queryKey: ["ticket-open-message"] });
    },
    onError: () => toast({ title: t("error"), variant: "destructive" }),
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Ticket className="w-8 h-8 text-primary" />
            {t("ticketsTitle")}
          </h2>
          <p className="text-muted-foreground mt-2">{t("ticketsDesc")}</p>
        </div>
      </div>

      <Card className="bg-card/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            {t("ticketOpenMessage")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingOpenMsg ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{t("ticketOpenMessageDesc")}</p>
              <Textarea
                value={openMessage}
                onChange={(e) => setOpenMessage(e.target.value)}
                placeholder={t("ticketOpenMessagePlaceholder")}
                className="bg-background/50 min-h-[120px] resize-none font-mono text-sm"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => saveOpenMessage.mutate(openMessage)}
                  disabled={saveOpenMessage.isPending || !openMessage.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveOpenMessage.isPending ? t("loading") : t("save")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOpenMessage("Hello {user}! A staff member will assist you shortly.\n\nPlease describe what you need below.")}
                >
                  {t("back")} Default
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
