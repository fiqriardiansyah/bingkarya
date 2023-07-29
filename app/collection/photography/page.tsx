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
import Photo from "./components/photo";
import PhotoAlbum from "./components/photo-album";
import ghostAnim from "@/animation/ghost.json";
import Lottie from "react-lottie";

export interface PhotosProperty {
    id?: string;
    image?: string;
    albumName?: string;
    albumLocation?: string;
    description?: string;
    albumId?: string;
    type?: string;
    albumItemCount?: number;
    albumDescription?: string;
    uid?: string;
    name?: string;
    location?: string;
    albumTag?: string[];
    tag?: string[];
    uploadDate?: number;
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

const groupingAlbum = (arr?: PhotosProperty[]) => {
    return arr?.reduce((acc: any[], curr) => {
        const node = acc.find((item: any[]) => item.find((subItem) => (subItem?.albumId ? subItem?.albumId === curr.albumId : false))) as any;
        if (node) node.push(curr);
        else acc.push([curr]);
        return acc;
    }, []);
};

const getMyPhotos = httpsCallable(functionInstance, "getMyPhotos");
export default function Page() {
    const { state } = useContext(UserContext);
    const uid = state?.user?.uid;

    const getMyPhotosQuery = useQuery(
        ["get-my-photo", uid],
        async () => {
            return (await getMyPhotos({ uid })).data as Promise<{ photos: PhotosProperty[] }>;
        },
        {
            enabled: !!uid,
        }
    );

    const grouping = groupingAlbum(getMyPhotosQuery.data?.photos) as PhotosProperty[][];

    const onDelete = () => {
        getMyPhotosQuery.refetch();
    };

    return (
        <div className="w-full">
            <div className="w-full flex items-center justify-between mb-10">
                <h1 className="m-0 font-semibold text-2xl">Koleksi Fotografi</h1>
                <Link href="/create/photo">
                    <Button variant="default">
                        <MdAddCircleOutline className="text-xl mr-3" />
                        Tambah
                    </Button>
                </Link>
            </div>
            <StateRender data={getMyPhotosQuery.data} isLoading={getMyPhotosQuery.isLoading} isError={getMyPhotosQuery.isError}>
                <StateRender.Data>
                    <div className="grid grid-cols-3 gap-3">
                        {grouping?.map((photos) =>
                            photos?.length === 1 ? (
                                <Photo onDelete={onDelete} photo={photos[0]} key={photos[0].id} />
                            ) : (
                                <PhotoAlbum onDelete={onDelete} photos={photos} key={photos[0].id} />
                            )
                        )}
                    </div>
                    {!grouping?.length ? (
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
                        <AlertDescription>{(getMyPhotosQuery.error as any)?.message}</AlertDescription>
                    </Alert>
                </StateRender.Error>
            </StateRender>
        </div>
    );
}
