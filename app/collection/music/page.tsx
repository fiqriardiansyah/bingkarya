"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import StateRender from "@/components/ui/state";
import { functionInstance } from "@/config/firebase-instance";
import { UserContext } from "@/context/user";
import { Skeleton } from "antd";
import { httpsCallable } from "firebase/functions";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useContext } from "react";
import { MdAddCircleOutline } from "react-icons/md";
import { useQuery } from "react-query";
import ghostAnim from "@/animation/ghost.json";
import Lottie from "react-lottie";
import Music from "./components/music";
import MusicAlbum from "./components/music-album";

export interface MusicProperty {
    id?: string;
    albumName?: string;
    albumThumbnail?: string;
    thumbnail?: string;
    albumId?: string;
    type?: string;
    uid?: string;
    music?: string;
    uploadDate?: number;
    albumLyrics?: string;
    albumItemCount?: number;
    name?: string;
    albumTag?: string[];
    tag?: any[];
    lyrics?: string;
    downloadCount?: number;
    loveCount?: string[];
    viewCount?: string[];
    komersil?: boolean;
}

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: ghostAnim,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

const groupingAlbum = (arr?: MusicProperty[]) => {
    return arr?.reduce((acc: any[], curr) => {
        const node = acc.find((item: any[]) => item.find((subItem) => (subItem?.albumId ? subItem?.albumId === curr.albumId : false))) as any;
        if (node) node.push(curr);
        else acc.push([curr]);
        return acc;
    }, []);
};

const getMyMusic = httpsCallable(functionInstance, "getMyMusic");

export default function Page() {
    const { state } = useContext(UserContext);
    const uid = state?.user?.uid;

    const getMyMusicQuery = useQuery(
        ["get-my-music", uid],
        async () => {
            return (await getMyMusic({ uid })).data as Promise<{ musics: MusicProperty[] }>;
        },
        {
            enabled: !!uid,
        }
    );

    const grouping = groupingAlbum(getMyMusicQuery.data?.musics) as MusicProperty[][];

    const onDelete = () => {
        getMyMusicQuery.refetch();
    };

    return (
        <div className="w-full">
            <div className="w-full flex items-center justify-between mb-10">
                <h1 className="m-0 font-semibold text-2xl">Koleksi Music</h1>
                <Link href="/create/music">
                    <Button variant="default">
                        <MdAddCircleOutline className="text-xl mr-3" />
                        Tambah
                    </Button>
                </Link>
            </div>
            <StateRender data={getMyMusicQuery.data} isLoading={getMyMusicQuery.isLoading} isError={getMyMusicQuery.isError}>
                <StateRender.Data>
                    <div className="grid grid-cols-4 gap-3">
                        {grouping?.map((musics) =>
                            musics?.length === 1 ? (
                                <Music onDelete={onDelete} music={musics[0]} key={musics[0].id} />
                            ) : (
                                <MusicAlbum onDelete={onDelete} musics={musics} key={musics[0].id} />
                            )
                        )}
                    </div>
                    {!getMyMusicQuery.data?.musics?.length ? (
                        <div className="flex items-center justify-center flex-col">
                            <Lottie
                                options={defaultOptions}
                                height={300}
                                width={300}
                                isClickToPauseDisabled={false}
                                style={{ pointerEvents: "none" }}
                            />
                            <h1 className="text-2xl">Kosong nih...</h1>
                        </div>
                    ) : null}
                </StateRender.Data>
                <StateRender.Loading>
                    <div className="grid grid-cols-3 gap-3">
                        {[...new Array(5)].map((_, i) => (
                            <Skeleton.Image active className="!h-[300px] !w-full" key={i} />
                        ))}
                    </div>
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{(getMyMusicQuery.error as any)?.message}</AlertDescription>
                    </Alert>
                </StateRender.Error>
            </StateRender>
        </div>
    );
}
