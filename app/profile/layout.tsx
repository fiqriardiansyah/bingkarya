"use client";

import { UserContext } from "@/context/user";
import Image from "next/image";
import { ReactNode, useContext } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { QueryClient, QueryClientProvider } from "react-query";
import Sidebar, { menus } from "./components/sidebar";
import { usePathname } from "next/navigation";
const queryClient = new QueryClient();

export default function Layout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { state } = useContext(UserContext);

    const profileimg = state?.user?.profileImg || state?.user?.photoURL || undefined;
    const name = state?.user?.username || state?.user?.displayName || "";

    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen mt-20 container mx-auto px-28">
                <div className="flex items-center gap-5 mt-10">
                    {profileimg ? (
                        <div className="w-[50px] h-[50px] relative rounded-full overflow-hidden">
                            <Image src={profileimg} alt={name} fill className="object-cover" />
                        </div>
                    ) : (
                        <FaRegUserCircle className="text-4xl text-gray-500" />
                    )}
                    <div className="">
                        <h1 className="m-0 font-semibold font-poppins text-xl">{name?.CapitalizeEachFirstLetter()}</h1>
                        <p className="m-0 capitalize text-gray-400 text-sm">{pathname ? menus?.find((m) => m.link === pathname)?.desc : ""}</p>
                    </div>
                </div>
                <div className="mb-10 mt-5">
                    <div className="flex items-center gap-10">
                        <p className="m-0 text-lg text-gray-500">
                            <span className="text-gray-900 text-xl font-semibold">{state?.user?.like || 0}</span> Kali karya disukai
                        </p>
                        <p className="m-0 text-lg text-gray-500">
                            <span className="text-gray-900 text-xl font-semibold">{state?.user?.download || 0}</span> Kali karya diunduh
                        </p>
                        <p className="m-0 text-lg text-gray-500">
                            <span className="text-gray-900 text-xl font-semibold">{state?.user?.view || 0}</span> Kali karya dilihat
                        </p>
                    </div>
                </div>
                <div className="flex gap-6">
                    <Sidebar />
                    {children}
                </div>
            </div>
        </QueryClientProvider>
    );
}
