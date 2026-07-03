import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Plus, Trash2, Coins } from "lucide-react";

const CURRENCY_NAME = "AetherCoin";

type ShopItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
};

type Channel = { id: string; name: string; type: number };

async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be at least 1"),
  imageUrl: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export default function Shop() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const { data: shopData, isLoading } = useQuery({
    queryKey: ["shop"],
    queryFn: () => apiCall<{ items: ShopItem[]; channelId: string | null }>("/api/bot/shop"),
  });

  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ["channels"],
    queryFn: () => apiCall<Channel[]>("/api/bot/channels"),
  });

  const setChannel = useMutation({
    mutationFn: (channelId: string) =>
      apiCall("/api/bot/shop/channel", { method: "POST", body: JSON.stringify({ channelId }) }),
    onSuccess: () => {
      toast({ title: "Shop channel updated" });
      queryClient.invalidateQueries({ queryKey: ["shop"] });
    },
    onError: () => toast({ title: "Failed to update channel", variant: "destructive" }),
  });

  const createItem = useMutation({
    mutationFn: (data: ItemFormValues) =>
      apiCall("/api/bot/shop", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          price: data.price,
          imageUrl: data.imageUrl || null,
        }),
      }),
    onSuccess: () => {
      toast({ title: "Item added to shop" });
      form.reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["shop"] });
    },
    onError: () => toast({ title: "Failed to add item", variant: "destructive" }),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => apiCall(`/api/bot/shop/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Item removed" });
      queryClient.invalidateQueries({ queryKey: ["shop"] });
    },
    onError: () => toast({ title: "Failed to remove item", variant: "destructive" }),
  });

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: "", description: "", price: 10, imageUrl: "" },
  });

  const items = shopData?.items || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shop</h2>
          <p className="text-muted-foreground mt-2">
            Items members can buy with {CURRENCY_NAME}.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} data-testid="button-toggle-form">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Card className="bg-card/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Shop Channel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={shopData?.channelId || undefined} onValueChange={(val) => setChannel.mutate(val)}>
            <SelectTrigger className="bg-background/50 max-w-sm" data-testid="select-shop-channel">
              <SelectValue placeholder={channelsLoading ? "Loading channels..." : "Select a channel"} />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {channels?.map((ch) => (
                <SelectItem key={ch.id} value={ch.id} data-testid={`option-channel-${ch.id}`}>
                  # {ch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            The bot posts (and keeps updated) a live shop message with buy buttons in this channel.
          </p>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              New Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((values) => createItem.mutate(values))} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. VIP Role" {...field} data-testid="input-item-name" className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ({CURRENCY_NAME})</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} data-testid="input-item-price" className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} data-testid="input-item-image" className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What the buyer gets..."
                          className="bg-background/50 resize-none"
                          {...field}
                          data-testid="textarea-item-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <Button type="submit" disabled={createItem.isPending} data-testid="button-submit-item">
                    {createItem.isPending ? "Saving..." : "Save Item"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      form.reset();
                    }}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
        ) : items.length > 0 ? (
          items.map((item, i) => (
            <Card
              key={item.id}
              className="bg-card/50 border-white/5 hover:border-primary/30 transition-colors overflow-hidden"
              data-testid={`card-shop-item-${i}`}
            >
              {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover" />}
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate" data-testid={`text-item-name-${i}`}>
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-primary font-mono text-sm">
                      <Coins className="w-3.5 h-3.5" />
                      {item.price} {CURRENCY_NAME}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={() => deleteItem.mutate(item.id)}
                    disabled={deleteItem.isPending}
                    data-testid={`button-delete-item-${i}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-card/50 border-white/5 md:col-span-2 lg:col-span-3">
            <CardContent className="py-16 text-center text-muted-foreground">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No items in the shop yet.</p>
              <p className="text-sm mt-1">Click "Add Item" to create your first product.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
