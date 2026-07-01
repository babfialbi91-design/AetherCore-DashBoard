import { useGetBotChannels, useSendBotAnnouncement } from "@workspace/api-client-react";
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

const schema = z.object({
  channelId: z.string().min(1, "Select a channel"),
  message: z.string().min(1, "Message cannot be empty").max(2000, "Max 2000 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function Announce() {
  const { data: channels, isLoading: channelsLoading } = useGetBotChannels();
  const send = useSendBotAnnouncement();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { channelId: "", message: "" },
  });

  const messageVal = form.watch("message");

  function onSubmit(values: FormValues) {
    send.mutate(
      { data: { channelId: values.channelId, message: values.message } },
      {
        onSuccess: (res) => {
          if (res.ok) {
            toast({ title: "Announcement sent successfully" });
            form.reset();
          } else {
            toast({ title: res.error || "Failed to send", variant: "destructive" });
          }
        },
        onError: () => toast({ title: "Failed to send announcement", variant: "destructive" }),
      }
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Announce</h2>
        <p className="text-muted-foreground mt-2">Send a message to any channel in your server.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" />
                Compose Announcement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="channelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Channel</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50" data-testid="select-channel">
                              <SelectValue placeholder={channelsLoading ? "Loading channels..." : "Select a channel"} />
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

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write your announcement here..."
                            className="bg-background/50 min-h-[160px] resize-none"
                            {...field}
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <div className="flex justify-between items-center mt-1">
                          <FormMessage />
                          <span className={`text-xs ml-auto ${messageVal.length > 1800 ? "text-destructive" : "text-muted-foreground"}`}>
                            {messageVal.length} / 2000
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={send.isPending} className="w-full" data-testid="button-send-announcement">
                    <Send className="w-4 h-4 mr-2" />
                    {send.isPending ? "Sending..." : "Send Announcement"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Messages support standard Discord markdown formatting.</p>
              <div className="space-y-1 font-mono text-xs bg-black/30 p-3 rounded-lg">
                <p><span className="text-primary">**bold**</span> — bold text</p>
                <p><span className="text-primary">*italic*</span> — italic text</p>
                <p><span className="text-primary">`code`</span> — inline code</p>
                <p><span className="text-primary">@everyone</span> — ping all</p>
              </div>
              <p>Max 2000 characters per message.</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {channelsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : channels?.map((ch) => (
                  <div key={ch.id} className="text-sm text-muted-foreground py-1 flex items-center gap-2" data-testid={`text-channel-${ch.id}`}>
                    <span className="text-primary">#</span>
                    {ch.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
