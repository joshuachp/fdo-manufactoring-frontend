import './App.css'
import AppSidebar from './components/app-sidebar'
import { SiteHeader } from './components/site-header'
import { ThemeProvider } from './components/theme/provider'
import { SidebarInset, SidebarProvider } from './components/ui/sidebar'
import { useLoaderData, Link } from 'react-router'
import { z } from 'zod'
import { Button } from './components/ui/button'
import { Settings } from 'lucide-react'
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

// Loader function to fetch and validate the rendezvous info
export async function rvInfoLoader() {
    try {
        const response = await fetch("http://127.0.0.1:8038/api/v1/rvinfo");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        const parsed = RendezvousInfoListSchema.safeParse(json);
        if (!parsed.success) {
            console.error("Zod Validation Error:", parsed.error);
            return { data: null, error: "Invalid data structure received from API" };
        }
        return { data: parsed.data, error: null };
    } catch (err) {
        console.error("Fetch Error:", err);
        return { data: null, error: "Failed to fetch rendezvous information from API" };
    }
}

function App() {
    const { data, error } = useLoaderData() as { data: RendezvousInfo[] | null; error: string | null };

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

                        {error ? (
                            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex flex-col gap-1 animate-in fade-in duration-300">
                                <span className="font-semibold">Loading Error</span>
                                <span>{error}</span>
                            </div>
                        ) : data && data.length > 0 ? (
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
                                        {data.map((item, idx) => (
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
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </ThemeProvider >
    )
}

export default App
