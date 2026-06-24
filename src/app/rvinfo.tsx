import React, { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeProvider } from "@/components/theme/provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { type RendezvousInfo, type LoaderData } from "@/App";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";

export function EditRvInfo() {
    const loaderData = useLoaderData() as LoaderData;
    const navigate = useNavigate();

    const [items, setItems] = useState<RendezvousInfo[]>(() => {
        if (loaderData.rvData && loaderData.rvData.length > 0) {
            return loaderData.rvData.map(item => ({ ...item }));
        }
        return [{ dns: "", device_port: "443", owner_port: "443", protocol: "https", delay_seconds: 10 }];
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const updateItem = (index: number, key: keyof RendezvousInfo, value: string | number) => {
        setItems(prev => prev.map((item, idx) => {
            if (idx === index) {
                return { ...item, [key]: value };
            }
            return item;
        }));
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, idx) => idx !== index));
        // Clean errors for this item and shift other errors
        setErrors(prev => {
            const nextErrors: Record<string, string> = {};
            Object.entries(prev).forEach(([errKey, val]) => {
                const [itemIdxStr, field] = errKey.split("-");
                const itemIdx = parseInt(itemIdxStr, 10);
                if (itemIdx < index) {
                    nextErrors[errKey] = val;
                } else if (itemIdx > index) {
                    nextErrors[`${itemIdx - 1}-${field}`] = val;
                }
            });
            return nextErrors;
        });
    };

    const addItem = () => {
        setItems(prev => [
            ...prev,
            { dns: "", device_port: "443", owner_port: "443", protocol: "https", delay_seconds: 10 }
        ]);
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        items.forEach((item, idx) => {
            if (!item.dns.trim()) {
                newErrors[`${idx}-dns`] = "DNS/Endpoint is required";
            }
            if (!item.device_port.trim()) {
                newErrors[`${idx}-device_port`] = "Device port is required";
            } else if (isNaN(Number(item.device_port))) {
                newErrors[`${idx}-device_port`] = "Must be a number";
            }
            if (!item.owner_port.trim()) {
                newErrors[`${idx}-owner_port`] = "Owner port is required";
            } else if (isNaN(Number(item.owner_port))) {
                newErrors[`${idx}-owner_port`] = "Must be a number";
            }
            if (!item.protocol.trim()) {
                newErrors[`${idx}-protocol`] = "Protocol is required";
            }
            if (item.delay_seconds === undefined || item.delay_seconds === null || isNaN(item.delay_seconds)) {
                newErrors[`${idx}-delay_seconds`] = "Delay is required";
            } else if (item.delay_seconds < 0) {
                newErrors[`${idx}-delay_seconds`] = "Cannot be negative";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            const response = await fetch("http://127.0.0.1:8038/api/v1/rvinfo", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(items),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setSubmitSuccess(true);
            setTimeout(() => {
                navigate("/");
            }, 1200);
        } catch (err) {
            console.error("Save error:", err);
            setSubmitError(err instanceof Error ? err.message : "Failed to update rendezvous information");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ThemeProvider defaultTheme='system' storageKey='app-ui-theme'>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader />
                    <main className="p-6 space-y-6 max-w-5xl">
                        <div className="flex items-center gap-4">
                            <Link to="/">
                                <Button variant="outline" size="icon-sm" type="button" title="Back to Dashboard">
                                    <ArrowLeft className="size-4" />
                                </Button>
                            </Link>
                            <div className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold tracking-tight">Configure Rendezvous Information</h2>
                                <p className="text-muted-foreground text-sm">
                                    Manage FDO rendezvous configurations. Fill the form below and save to update server settings.
                                </p>
                            </div>
                        </div>

                        {submitSuccess && (
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-500 flex flex-col gap-1 animate-in fade-in duration-300">
                                <span className="font-semibold">Success</span>
                                <span>Rendezvous configurations updated successfully! Redirecting...</span>
                            </div>
                        )}

                        {submitError && (
                            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex flex-col gap-1 animate-in fade-in duration-300">
                                <span className="font-semibold">Error Saving Configuration</span>
                                <span>{submitError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                {items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="relative rounded-lg border bg-card p-5 space-y-4 shadow-sm animate-in fade-in duration-300"
                                    >
                                        <div className="flex items-center justify-between border-b pb-3">
                                            <h3 className="font-semibold text-sm">Endpoint #{idx + 1}</h3>
                                            {items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="xs"
                                                    onClick={() => removeItem(idx)}
                                                    disabled={submitting}
                                                >
                                                    <Trash2 className="mr-1 size-3" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                            <div className="flex flex-col gap-1.5 lg:col-span-2">
                                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                    DNS / Endpoint
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="fdo-rendezvous.clea-dev.midgar.services"
                                                    value={item.dns}
                                                    onChange={e => updateItem(idx, "dns", e.target.value)}
                                                    disabled={submitting}
                                                    className={errors[`${idx}-dns`] ? "border-destructive focus-visible:ring-destructive/20" : ""}
                                                />
                                                {errors[`${idx}-dns`] && (
                                                    <span className="text-[10px] text-destructive font-medium">{errors[`${idx}-dns`]}</span>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Protocol
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="https"
                                                    value={item.protocol}
                                                    onChange={e => updateItem(idx, "protocol", e.target.value)}
                                                    disabled={submitting}
                                                    className={errors[`${idx}-protocol`] ? "border-destructive focus-visible:ring-destructive/20" : ""}
                                                />
                                                {errors[`${idx}-protocol`] && (
                                                    <span className="text-[10px] text-destructive font-medium">{errors[`${idx}-protocol`]}</span>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Device Port
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="443"
                                                    value={item.device_port}
                                                    onChange={e => updateItem(idx, "device_port", e.target.value)}
                                                    disabled={submitting}
                                                    className={errors[`${idx}-device_port`] ? "border-destructive focus-visible:ring-destructive/20" : ""}
                                                />
                                                {errors[`${idx}-device_port`] && (
                                                    <span className="text-[10px] text-destructive font-medium">{errors[`${idx}-device_port`]}</span>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Owner Port
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder="443"
                                                    value={item.owner_port}
                                                    onChange={e => updateItem(idx, "owner_port", e.target.value)}
                                                    disabled={submitting}
                                                    className={errors[`${idx}-owner_port`] ? "border-destructive focus-visible:ring-destructive/20" : ""}
                                                />
                                                {errors[`${idx}-owner_port`] && (
                                                    <span className="text-[10px] text-destructive font-medium">{errors[`${idx}-owner_port`]}</span>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Delay (seconds)
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="10"
                                                    value={item.delay_seconds ?? ""}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        updateItem(idx, "delay_seconds", val === "" ? 0 : parseInt(val, 10));
                                                    }}
                                                    disabled={submitting}
                                                    className={errors[`${idx}-delay_seconds`] ? "border-destructive focus-visible:ring-destructive/20" : ""}
                                                />
                                                {errors[`${idx}-delay_seconds`] && (
                                                    <span className="text-[10px] text-destructive font-medium">{errors[`${idx}-delay_seconds`]}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addItem}
                                    disabled={submitting}
                                >
                                    <Plus className="mr-1.5 size-3.5" />
                                    Add Endpoint
                                </Button>

                                <div className="ml-auto flex items-center gap-2">
                                    <Link to="/">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        variant="default"
                                        disabled={submitting}
                                    >
                                        <Save className="mr-1.5 size-3.5" />
                                        {submitting ? "Saving..." : "Save Configuration"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </ThemeProvider>
    );
}

export default EditRvInfo;
