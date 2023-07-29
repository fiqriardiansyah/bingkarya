"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Nav from "./nav";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next-nprogress-bar";

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();

    const onSearch = (e: any) => {
        e?.preventDefault();
        const query = e?.target?.search?.value;
        if (!query) return;
        router.push("/?q=" + query);
    };

    const pathsWithoutSearch = ["/profile", "/create", "/create/photo", "/create/music", "/create/video"];
    const pathsWithoutNavigation = ["/signin", "/signup"];

    if (pathsWithoutNavigation.indexOf(pathname) !== -1) {
        return null;
    }

    return (
        <header
            className="w-full fixed top-0 left-0 right-0 z-50 bg-white"
            style={{ borderBottom: "1px solid rgb(203 213 225 / var(--tw-bg-opacity))" }}
        >
            <div className="container mx-auto px-10 py-3 flex items-center justify-between">
                <div className="flex items-center gap-x-10">
                    <Link href="/">
                        <Image src="/images/bingkarya.svg" alt="bingkay karya" width={100} height={40} />
                    </Link>
                    {pathsWithoutSearch.indexOf(pathname) === -1 ? (
                        <form action="" onSubmit={onSearch} className="flex w-full max-w-sm items-center space-x-2">
                            <Input type="text" placeholder="Cari apa aja.." name="search" className="w-[400px]" />
                            <Button type="submit">Cari</Button>
                        </form>
                    ) : null}
                </div>
                <Nav />
            </div>
        </header>
    );
}
