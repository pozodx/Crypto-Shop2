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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const settingsSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  shopDescription: z.string(),
  heroTitle: z.string().min(1, "Hero title is required"),
  heroSubtitle: z.string(),
  heroBadge: z.string(),
  bgColor: z.string().min(1, "Background color is required"),
  accentColor: z.string().min(1, "Accent color is required"),
  logoUrl: z.string().nullable().optional(),
  btcAddress: z.string(),
  ethAddress: z.string(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function SettingsAdmin() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      shopName: "",
      shopDescription: "",
      heroTitle: "",
      heroSubtitle: "",
      heroBadge: "",
      bgColor: "#0a0a0a",
      accentColor: "#ffffff",
      logoUrl: "",
      btcAddress: "",
      ethAddress: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        shopName: settings.shopName || "",
        shopDescription: settings.shopDescription || "",
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        heroBadge: settings.heroBadge || "",
        bgColor: settings.bgColor || "#0a0a0a",
        accentColor: settings.accentColor || "#ffffff",
        logoUrl: settings.logoUrl || "",
        btcAddress: settings.btcAddress || "",
        ethAddress: settings.ethAddress || "",
      });
    }
  }, [settings, form]);

  const onSubmit = (values: SettingsForm) => {
    updateSettings.mutate(
      { data: { ...values, logoUrl: values.logoUrl || null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          toast({ title: "Settings saved" });
        },
        onError: () => toast({ title: "Failed to save settings", variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-8 w-40 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </AdminLayout>
    );
  }

  const bgValue = form.watch("bgColor") || "#0a0a0a";
  const accentValue = form.watch("accentColor") || "#ffffff";

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Customize your storefront — changes reflect instantly on the shop.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* General */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">General</CardTitle>
                <CardDescription>Shop name and tagline shown across the store.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="shopName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Name</FormLabel>
                    <FormControl><Input placeholder="My Crypto Shop" {...field} data-testid="input-shop-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="shopDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Description</FormLabel>
                    <FormControl><Textarea placeholder="Digital goods delivered instantly..." {...field} rows={2} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="logoUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl><Input placeholder="https://example.com/logo.png" {...field} value={field.value ?? ""} data-testid="input-logo-url" /></FormControl>
                    <FormDescription>Paste a direct image link. Leave blank to show the shop name as text.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Hero Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Hero Section</CardTitle>
                <CardDescription>The big headline your customers see first.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="heroBadge" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge Text</FormLabel>
                    <FormControl><Input placeholder="INSTANT DELIVERY" {...field} data-testid="input-hero-badge" /></FormControl>
                    <FormDescription>Short label shown above the main title (e.g. "INSTANT DELIVERY").</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="heroTitle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Title</FormLabel>
                    <FormControl><Input placeholder="Premium Quality, Smart Prices" {...field} data-testid="input-hero-title" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="heroSubtitle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl><Textarea placeholder="Great products don't have to be expensive..." {...field} rows={2} data-testid="input-hero-subtitle" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Appearance</CardTitle>
                <CardDescription>Colors used across the storefront.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField control={form.control} name="bgColor" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={field.value}
                        onChange={field.onChange}
                        className="w-10 h-10 rounded-md cursor-pointer border border-border bg-transparent p-0.5"
                        data-testid="input-bg-color"
                      />
                      <FormControl>
                        <Input {...field} placeholder="#0a0a0a" className="font-mono flex-1" />
                      </FormControl>
                    </div>
                    <FormDescription>The page background. Dark colors work best.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="accentColor" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accent Color</FormLabel>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={field.value}
                        onChange={field.onChange}
                        className="w-10 h-10 rounded-md cursor-pointer border border-border bg-transparent p-0.5"
                        data-testid="input-accent-color"
                      />
                      <FormControl>
                        <Input {...field} placeholder="#ffffff" className="font-mono flex-1" />
                      </FormControl>
                    </div>
                    <FormDescription>Used for buttons, badges, and highlights.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Live preview */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="px-3 py-2 border-b border-border text-xs text-muted-foreground">Live preview</div>
                  <div className="p-6 flex flex-col items-center gap-3" style={{ backgroundColor: bgValue }}>
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase"
                      style={{ borderColor: `${accentValue}30`, color: accentValue, backgroundColor: `${accentValue}10` }}
                    >
                      Badge Text
                    </span>
                    <span className="text-xl font-black text-white">Your Shop Title</span>
                    <button
                      type="button"
                      className="rounded-full px-5 py-2 text-xs font-bold"
                      style={{ backgroundColor: accentValue, color: bgValue }}
                    >
                      Explore Products
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Wallets */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Payment Wallets</CardTitle>
                <CardDescription>Where you receive customer payments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="btcAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitcoin (BTC) Address</FormLabel>
                    <FormControl><Input className="font-mono text-xs" placeholder="bc1q..." {...field} data-testid="input-btc-address" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ethAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ethereum (ETH) Address</FormLabel>
                    <FormControl><Input className="font-mono text-xs" placeholder="0x..." {...field} data-testid="input-eth-address" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Button type="submit" disabled={updateSettings.isPending} data-testid="button-save-settings" className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {updateSettings.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
