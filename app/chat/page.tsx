"use client";

import { useContext } from "react";
import Chat from "../lib/chat/components/chat";
import Chats from "../lib/chat/components/chats";
import { ConfigContext } from "@/context/config";

export default function Page() {
    const { state } = useContext(ConfigContext);
    return (
        <div className="h-screen flex container mx-auto px-28 pt-20 ">
            <div className="w-[30vw] h-full">
                <Chats />
            </div>
            <div className="h-full bg-slate-300" style={{ width: "1px" }} />
            <div className="w-full h-full">
                <Chat />
            </div>
        </div>
    );
}
