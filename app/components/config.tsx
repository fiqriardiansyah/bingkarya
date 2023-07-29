"use client";

import "@/lib/extension";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { UserProvider } from "@/context/user";
import { QueryClient, QueryClientProvider } from "react-query";
import Navigation from "@/components/navigation";
import { ConfigProvider } from "@/context/config";
import { ConfigProvider as ConfigProviderAntd } from "antd";
import { ChatProvider } from "@/context/chat";

const queryClient = new QueryClient();

const Config = ({ children }: { children: any }) => {
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <ConfigProviderAntd theme={{}}>
                    <UserProvider>
                        <ConfigProvider>
                            <ChatProvider>
                                <Navigation />
                                {children}
                            </ChatProvider>
                        </ConfigProvider>
                    </UserProvider>
                </ConfigProviderAntd>
            </QueryClientProvider>
            <ProgressBar height="2px" color="#1B1B1A" options={{ showSpinner: true, parent: "body" }} shallowRouting />
        </>
    );
};

export default Config;
