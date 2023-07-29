"use client";

import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TiMessages } from "react-icons/ti";
import MenuNavigation from "../menu-navigation";
import ProfileAvatar from "../profile-avatar";

export default function Nav() {
    const session = Cookies.get("session");
    const [login, setLogin] = useState(false);

    useEffect(() => {
        setLogin(!!session);
    }, [session]);

    return (
        <nav className="flex items-center gap-x-6 relative">
            {!login ? (
                <Link href="/signin">
                    <Button variant="outline">Masuk</Button>
                </Link>
            ) : (
                <>
                    <MenuNavigation />
                    <Link href="/chat">
                        <button className="cursor-pointer" title="Percakapan">
                            <TiMessages className=" text-xl" />
                        </button>
                    </Link>
                    <ProfileAvatar />
                </>
            )}
        </nav>
    );
}
