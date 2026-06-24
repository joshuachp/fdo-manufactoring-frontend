import './App.css'
import AppSidebar from './components/app-sidebar'
import { SiteHeader } from './components/site-header'
import { ThemeProvider } from './components/theme/provider'
import { SidebarInset, SidebarProvider } from './components/ui/sidebar'
import { useLoaderData, Link } from 'react-router'
import { z } from 'zod'
import { Button } from './components/ui/button'
import { Settings, Download } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './components/ui/table'

// Define the Zod schema for validating the API payload
export const RendezvousInfoSchema = z.object({
    dns: z.string(),
    device_port: z.string(),
    owner_port: z.string(),
    protocol: z.string(),
    delay_seconds: z.number(),
});

export const RendezvousInfoListSchema = z.array(RendezvousInfoSchema);

export type RendezvousInfo = z.infer<typeof RendezvousInfoSchema>;

// Define the Zod schema for validating the Vouchers payload
export const VoucherSchema = z.object({
    guid: z.string(),
    device_info: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const VoucherListSchema = z.array(VoucherSchema);

export type Voucher = z.infer<typeof VoucherSchema>;

export type LoaderData = {
    rvData: RendezvousInfo[] | null;
    rvError: string | null;
    voucherData: Voucher[] | null;
    voucherError: string | null;
};

// Loader function to fetch and validate the rendezvous info and vouchers
export async function rvInfoLoader(): Promise<LoaderData> {
    try {
        const [rvRes, voucherRes] = await Promise.all([
            fetch("http://127.0.0.1:8038/api/v1/rvinfo"),
            fetch("http://127.0.0.1:8038/api/v1/vouchers")
        ]);

        let rvData: RendezvousInfo[] | null = null;
        let rvError: string | null = null;
        if (!rvRes.ok) {
            rvError = `Rendezvous API returned status ${rvRes.status}`;
        } else {
            const json = await rvRes.json();
            const parsed = RendezvousInfoListSchema.safeParse(json);
            if (!parsed.success) {
                console.error("Rendezvous Validation Error:", parsed.error);
                rvError = "Invalid rendezvous data structure received from API";
            } else {
                rvData = parsed.data;
            }
        }

        let voucherData: Voucher[] | null = null;
        let voucherError: string | null = null;
        if (!voucherRes.ok) {
            voucherError = `Vouchers API returned status ${voucherRes.status}`;
        } else {
            const json = await voucherRes.json();
            const parsed = VoucherListSchema.safeParse(json);
            if (!parsed.success) {
                console.error("Voucher Validation Error:", parsed.error);
                voucherError = "Invalid voucher data structure received from API";
            } else {
                voucherData = parsed.data;
            }
        }

        return { rvData, rvError, voucherData, voucherError };
    } catch (err) {
        console.error("Fetch Error:", err);
        return {
            rvData: null,
            rvError: "Failed to fetch data from API",
            voucherData: null,
            voucherError: "Failed to fetch data from API"
        };
    }
}

function App() {
    const { rvData, rvError, voucherData, voucherError } = useLoaderData() as LoaderData;

    return (
        <ThemeProvider defaultTheme='system' storageKey='app-ui-theme'>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader />
                    <main className="p-6 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-2xl font-bold tracking-tight">Rendezvous Information</h2>
                                <p className="text-muted-foreground text-sm">
                                    View and manage active rendezvous configurations for devices and owner ports.
                                </p>
                            </div>
                            <div className="shrink-0">
                                <Link to="/rvinfo">
                                    <Button variant="default" size="sm">
                                        <Settings className="mr-1.5 size-3.5" />
                                        Edit Settings
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {rvError ? (
                            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex flex-col gap-1 animate-in fade-in duration-300">
                                <span className="font-semibold">Loading Error</span>
                                <span>{rvError}</span>
                            </div>
                        ) : rvData && rvData.length > 0 ? (
                            <div className="rounded-lg border bg-card overflow-hidden shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-semibold">DNS / Endpoint</TableHead>
                                            <TableHead className="font-semibold">Protocol</TableHead>
                                            <TableHead className="font-semibold text-right">Device Port</TableHead>
                                            <TableHead className="font-semibold text-right">Owner Port</TableHead>
                                            <TableHead className="font-semibold text-right">Delay</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rvData.map((item, idx) => (
                                            <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-medium font-mono text-foreground">{item.dns}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${item.protocol.toLowerCase() === 'https'
                                                        ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20 dark:bg-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-500 ring-amber-500/20 dark:bg-amber-500/20'
                                                        }`}>
                                                        {item.protocol}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-muted-foreground">{item.device_port}</TableCell>
                                                <TableCell className="text-right font-mono text-muted-foreground">{item.owner_port}</TableCell>
                                                <TableCell className="text-right font-mono text-muted-foreground">{item.delay_seconds}s</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground animate-in fade-in duration-300">
                                No rendezvous configurations found.
                            </div>
                        )}

                        {/* Vouchers Section */}
                        <div className="flex flex-col gap-2 border-b pb-4 pt-4">
                            <h2 className="text-2xl font-bold tracking-tight">Vouchers</h2>
                            <p className="text-muted-foreground text-sm">
                                View active ownership vouchers registered in the manufacturing server.
                            </p>
                        </div>

                        {voucherError ? (
                            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex flex-col gap-1 animate-in fade-in duration-300">
                                <span className="font-semibold">Loading Error</span>
                                <span>{voucherError}</span>
                            </div>
                        ) : voucherData && voucherData.length > 0 ? (
                            <div className="rounded-lg border bg-card overflow-hidden shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-semibold">GUID</TableHead>
                                            <TableHead className="font-semibold">Device Info</TableHead>
                                            <TableHead className="font-semibold text-right">Created At</TableHead>
                                            <TableHead className="font-semibold text-right">Updated At</TableHead>
                                            <TableHead className="font-semibold text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {voucherData.map((item, idx) => (
                                            <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-medium font-mono text-foreground text-xs">{item.guid}</TableCell>
                                                <TableCell className="text-muted-foreground font-mono text-xs">{item.device_info}</TableCell>
                                                <TableCell className="text-right font-mono text-muted-foreground text-xs">
                                                    {new Date(item.created_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-muted-foreground text-xs">
                                                    {new Date(item.updated_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <a
                                                        href={`http://127.0.0.1:8038/api/v1/vouchers/${item.guid}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Download ownership voucher"
                                                    >
                                                        <Button variant="outline" size="icon-xs" type="button">
                                                            <Download className="size-3" />
                                                        </Button>
                                                    </a>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground animate-in fade-in duration-300">
                                No vouchers found.
                            </div>
                        )}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </ThemeProvider >
    )
}

export default App
