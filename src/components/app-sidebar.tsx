import { Server } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "@/components/ui/sidebar";
import {
    Item,
    ItemSeparator,
    ItemDescription,
    ItemMedia,
    ItemTitle,
    ItemContent,
    ItemActions,
} from "@/components/ui/item";
import { Suspense, useDeferredValue, useEffect, useState } from "react";
import DotPulse from "./dot-pulse";

import * as z from "zod";

const Status = z.object({
    version: z.string(),
    status: z.string(),
});

interface ServerStatusProps {
    desc: string;
    isOk: boolean;
}

export function ServerStatus({ desc, isOk }: ServerStatusProps) {
    return (
        <Item>
            <ItemMedia variant="icon">
                <Server />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>Status</ItemTitle>
                <ItemDescription>{desc}</ItemDescription>
            </ItemContent>
            <ItemActions>
                <DotPulse ok={isOk} />
            </ItemActions>
        </Item>
    );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [status, setStatus] = useState<ServerStatusProps>({
        desc: "",
        isOk: true,
    });
    const defferStatus = useDeferredValue(status);

    useEffect(() => {
        fetch("http://127.0.0.1:8041/health", {
            headers: {
                accept: "application/json",
                "access-control-allow-origin": "http://127.0.0.1:8041"
            }
        })
            .then((resp) => {
                console.trace(`server status: ${resp.status}`);

                return resp.json();
            })
            .then((resp) => {
                console.log(resp)
                const result = Status.safeParse(resp);

                if (!result.success) {
                    console.error(result.error);

                    setStatus({
                        isOk: false,
                        desc: "Error",
                    });
                } else {
                    setStatus({
                        isOk: result.data.status == "OK",
                        desc: `${result.data.version} - ${result.data.status}`,
                    });
                }
            })
            .catch((error) => {
                console.error("couldn't get status", error);

                setStatus({
                    isOk: false,
                    desc: "Error",
                });
            });
    }, []);

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup />
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter>
                <ItemSeparator />
                <Suspense fallback={<h1>loading...</h1>}>
                    <ServerStatus {...defferStatus} />
                </Suspense>
            </SidebarFooter>
        </Sidebar>
    );
}

export default AppSidebar;
