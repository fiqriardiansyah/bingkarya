"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import Sidebar from "./components/sidebar";
const queryClient = new QueryClient();

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen mt-20 container mx-auto px-28 flex gap-4">
                <Sidebar />
                {children}
            </div>
        </QueryClientProvider>
    );
}
