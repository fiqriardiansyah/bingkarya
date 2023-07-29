"use client";

import { Button } from "@/components/ui/button";
import { memo } from "react";
import { TbMusic } from "react-icons/tb";
import { TfiVideoClapper } from "react-icons/tfi";
import { TbPhotoHeart } from "react-icons/tb";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
    {
        icon: <TbPhotoHeart />,
        title: "Fotografi",
        link: "/collection/photography",
    },
    {
        icon: <TfiVideoClapper />,
        title: "Video",
        link: "/collection/video",
    },
    {
        icon: <TbMusic />,
        title: "Musik",
        link: "/collection/music",
    },
];

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <div className="w-[200px] flex flex-col gap-2 pr-2 h-fit sticky top-20" style={{ borderRight: "1px solid #dedede" }}>
            <h1 className="text-xl font-semibold ml-4 font-poppins">Koleksi</h1>
            {menus.map((m) => (
                <Link href={m.link} key={m.title} className="w-full">
                    <Button variant={m.link === pathname ? "secondary" : "ghost"} className="flex items-center gap-2 justify-start w-full">
                        {m.icon}
                        {m.title}
                    </Button>
                </Link>
            ))}
        </div>
    );
};

export default memo(Sidebar);
