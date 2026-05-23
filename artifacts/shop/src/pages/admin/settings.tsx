import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const settingsSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  shopDescription: z.string().min(1, "Shop description is required"),
  btcAddress: z.string().min(1, "BTC Address is required"),
  ethAddress: z.string().min(1, "ETH Address is required"),
});

export default function SettingsAdmin() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      shopName: "",
      shopDescription: "",
      btcAddress: "",
      ethAddress: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        shopName: settings.shopName || "",
        shopDescription: settings.shopDescription || "",
        btcAddress: settings.btcAddress || "",
        ethAddress: settings.ethAddress || "",
      });
    }
  }, [settings, form]);

  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    updateSettings.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          toast({ title: "Settings saved successfully" });
        },
        onError: () => {
          toast({ title: "Failed to save settings", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <div className="animate-pulse h-64 bg-muted rounded-xl"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>Basic information about your digital store.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="shopName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Digital Goods Store" {...field} data-testid="input-shop-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shopDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline / Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Buy digital assets with crypto." {...field} data-testid="input-shop-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Wallets</CardTitle>
                <CardDescription>Where you will receive customer payments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="btcAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bitcoin (BTC) Address</FormLabel>
                      <FormControl>
                        <Input className="font-mono text-sm" placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" {...field} data-testid="input-btc-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ethAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ethereum (ETH) Address</FormLabel>
                      <FormControl>
                        <Input className="font-mono text-sm" placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d8976F" {...field} data-testid="input-eth-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button type="submit" disabled={updateSettings.isPending} data-testid="button-save-settings">
              <Save className="w-4 h-4 mr-2" />
              {updateSettings.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
