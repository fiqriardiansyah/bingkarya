"use client";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import ListItem from "./list-item";
import Link from "next/link";
import { httpsCallable } from "firebase/functions";
import { functionInstance } from "@/config/firebase-instance";
import { useQuery } from "react-query";
import StateRender from "../ui/state";
import { Skeleton } from "antd";

const getPopularContent = httpsCallable(functionInstance, "getPopularContent");

export default function MenuNavigation() {
    const getPopular = useQuery(["get-popular"], async () => {
        return (await getPopularContent()).data as { result: any };
    });

    const types = {
        video: "v",
        music: "m",
        photo: "p",
        "": "",
    };

    const type = (getPopular.data?.result?.art || "") as keyof typeof types;

    const link = "/" + types[type] + "/" + getPopular.data?.result?.id;

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Buat Karya</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                            <li className="row-span-3">
                                <StateRender data={getPopular.data} isLoading={getPopular.isLoading} isError={getPopular.isError}>
                                    <StateRender.Data>
                                        <Link href={link}>
                                            <NavigationMenuLink asChild>
                                                <div className="group p-3 relative bg-gray-600 flex h-full w-full select-none flex-col justify-end no-underline outline-none ">
                                                    <Image
                                                        src={
                                                            getPopular.data?.result?.image ||
                                                            getPopular.data?.result?.thumbnail ||
                                                            getPopular.data?.result?.mainThumbnail
                                                        }
                                                        alt="kary trending"
                                                        fill
                                                        className="object-cover z-0 opacity-30 group-hover:opacity-100 duration-150"
                                                    />
                                                    <div className="mb-2 mt-4 text-lg font-medium z-10  group-hover:opacity-0 opacity-100 duration-150 group-hover:translate-y-5">
                                                        <Image src="/images/bingkarya-white.svg" alt="bingkay karya" width={100} height={40} />
                                                    </div>
                                                    <p className="text-sm leading-tight text-white z-10 drop-shadow-md group-hover:opacity-0 opacity-100 duration-150 group-hover:translate-y-10">
                                                        Publikasikan hasil karyamu seperti fotografi, video dan musik agar dilirik banyak orang
                                                    </p>
                                                    <div className="w-full bg-white z-20 absolute bottom-0 left-0 p-2 opacity-0 translate-y-5 group-hover:opacity-100 duration-200 group-hover:translate-y-0">
                                                        <p className="m-0 text-sm text-gray-400">Karya populer saat ini</p>
                                                        <span className="text-gray-800 capitalize m-0 text-lg line-clamp-1 leading-none">
                                                            {getPopular.data?.result?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </NavigationMenuLink>
                                        </Link>
                                    </StateRender.Data>
                                    <StateRender.Loading>
                                        <Skeleton.Image className="w-full mb-5" active />
                                        <Skeleton paragraph={{ rows: 3 }} active />
                                    </StateRender.Loading>
                                </StateRender>
                            </li>
                            <Link href="/create/photo">
                                <ListItem title="Karya Fotografi">Kamu bisa upload foto dan menjadikannya album</ListItem>
                            </Link>
                            <Link href="/create/video">
                                <ListItem title="Karya Video">Upload video pendek dan ditonton banyak orang</ListItem>
                            </Link>
                            <Link href="/create/music">
                                <ListItem title="Karya Music">Beritahu orang-orang bahwa kamu membuat music</ListItem>
                            </Link>
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
