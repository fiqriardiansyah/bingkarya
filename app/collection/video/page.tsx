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
import Video from "./components/video";

export interface VideosProperty {
    id?: string;
    uid?: string;
    uploadDate?: number;
    name?: string;
    description?: string;
    location?: string;
    video?: string;
    tag?: string[];
    thumbnails: string[];
    mainThumbnail: string;
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

const getMyVideos = httpsCallable(functionInstance, "getMyVideos");

export default function Page() {
    const { state } = useContext(UserContext);
    const uid = state?.user?.uid;

    const getMyVideosQuery = useQuery(
        ["get-my-video", uid],
        async () => {
            return (await getMyVideos({ uid })).data as Promise<{ videos: VideosProperty[] }>;
        },
        {
            enabled: !!uid,
        }
    );

    const onDelete = () => {
        getMyVideosQuery.refetch();
    };

    return (
        <div className="w-full">
            <div className="w-full flex items-center justify-between mb-10">
                <h1 className="m-0 font-semibold text-2xl">Koleksi Video</h1>
                <Link href="/create/video">
                    <Button variant="default">
                        <MdAddCircleOutline className="text-xl mr-3" />
                        Tambah
                    </Button>
                </Link>
            </div>
            <StateRender data={getMyVideosQuery.data} isLoading={getMyVideosQuery.isLoading} isError={getMyVideosQuery.isError}>
                <StateRender.Data>
                    <div className="grid grid-cols-3 gap-3">
                        {getMyVideosQuery.data?.videos?.map((video) => (
                            <Video onDelete={onDelete} video={video} key={video.id} />
                        ))}
                    </div>
                    {!getMyVideosQuery.data?.videos?.length ? (
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
                        <AlertDescription>{(getMyVideosQuery.error as any)?.message}</AlertDescription>
                    </Alert>
                </StateRender.Error>
            </StateRender>
        </div>
    );
}
