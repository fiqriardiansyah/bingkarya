"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";

export const menus = [
    {
        title: "Akun",
        link: "/profile/account",
        desc: "Perbarui username dan kelola akunmu",
    },
    {
        title: "Edit Profil",
        link: "/profile/edit",
        desc: "Atur kehadiranmu dan kebutuhan perekrutan",
    },
    {
        title: "Password",
        link: "/profile/password",
        desc: "Keleloa passwordmu",
    },
];

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <div className="w-[200px] flex flex-col gap-2 pr-2 h-fit sticky top-20" style={{ borderRight: "1px solid #dedede" }}>
            {menus.map((m) => (
                <Link href={m.link} key={m.title} className="w-full">
                    <Button variant={m.link === pathname ? "secondary" : "ghost"} className="flex items-center gap-2 justify-start w-full">
                        {m.title}
                    </Button>
                </Link>
            ))}
        </div>
    );
};

export default memo(Sidebar);
