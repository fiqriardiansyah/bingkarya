"use client";

import { MusicProperty } from "@/app/collection/music/page";
import DownloadButton from "@/app/components/download-button";
import LikeButton from "@/app/components/like-button";
import OwnerContent from "@/app/components/owner-content";
import PlayButton from "@/app/components/play-button";
import ShopButton from "@/app/components/shop-button";
import ViewButton from "@/app/components/view-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import StateRender from "@/components/ui/state";
import { functionInstance } from "@/config/firebase-instance";
import { UserContext } from "@/context/user";
import { FORMAT_DATE, createChatId } from "@/lib/utils";
import { ChatInfo } from "@/models";
import { Skeleton } from "antd";
import { httpsCallable } from "firebase/functions";
import HTMLReactParser from "html-react-parser";
import { AlertCircle } from "lucide-react";
import moment from "moment";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useRef } from "react";
import { AiFillHeart, AiOutlinePlayCircle } from "react-icons/ai";
import { BsCalendarCheck } from "react-icons/bs";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { GrNext, GrPrevious } from "react-icons/gr";
import { PiShareFatBold } from "react-icons/pi";
import { useQuery } from "react-query";

type PageProps = {
    params: {
        slug: string;
    };
};

const getMusicDetail = httpsCallable(functionInstance, "getMusicDetail");

export default function Page({ params }: PageProps) {
    const { state } = useContext(UserContext);
    const downloadRef = useRef<HTMLAnchorElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    const getDetailQuery = useQuery(
        ["get-detail-vid", params?.slug],
        async () => {
            return (await getMusicDetail({ id: params?.slug })).data as MusicProperty & { list?: MusicProperty[] };
        },
        {
            enabled: !!params?.slug,
        }
    );

    const currIndex = getDetailQuery.data?.list ? getDetailQuery.data.list.findIndex((m) => m.id === params.slug) : 0;

    const download = (music?: MusicProperty) => {
        return () => {
            if (downloadRef.current) {
                downloadRef.current.href = music?.music!;
                downloadRef.current.click();
            }
        };
    };

    const onNextMusic = () => {
        if (!getDetailQuery.data?.list) return;
        const nextId = currIndex !== getDetailQuery.data.list.length - 1 ? currIndex + 1 : 0;
        router.push("/m/" + getDetailQuery.data.list[nextId]?.id);
    };

    const onPrevMusic = () => {
        if (!getDetailQuery.data?.list) return;
        const nextId = currIndex !== 0 ? currIndex - 1 : getDetailQuery.data.list.length - 1;
        router.push("/m/" + getDetailQuery.data.list[nextId]?.id);
    };

    const refreshDetail = () => {
        getDetailQuery.refetch();
    };

    const share = () => {
        if (navigator && typeof window !== "undefined") {
            navigator.share({
                title: getDetailQuery.data?.name?.CapitalizeEachFirstLetter(),
                text: "Coba cek karya ini! \n " + getDetailQuery.data?.name,
                url: window.location.href.toString(),
            });
        }
    };

    const chatId = createChatId({ uids: [state?.user?.uid as any, getDetailQuery.data?.uid as any], postfix: params?.slug as any });
    const chatInfo: ChatInfo = {
        anyid: params?.slug as any,
        anytitle: getDetailQuery.data?.name as any,
        uid: getDetailQuery.data?.uid as any,
        cid: chatId,
        id: chatId,
        link: "/m/" + params?.slug,
    };

    return (
        <div className="min-h-screen mt-16">
            <a ref={downloadRef} target="_blank" download id="download" hidden></a>
            <OwnerContent uid={getDetailQuery.data?.uid} />
            <StateRender data={getDetailQuery.data} isLoading={getDetailQuery.isLoading} isError={getDetailQuery.isError}>
                <StateRender.Data>
                    <div className="flex container mx-auto px-28">
                        <div className="flex-1 px-10">
                            <div className="relative w-full flex flex-col items-center mt-10">
                                <div className="flex items-center w-full justify-between">
                                    <button title="Sebelumnya" onClick={onPrevMusic}>
                                        <GrPrevious className="text-3xl" />
                                    </button>
                                    <div className="relative w-[300px] h-[300px] rounded-full overflow-hidden mb-10">
                                        <Image
                                            key={getDetailQuery.data?.name}
                                            src={getDetailQuery.data?.thumbnail!}
                                            alt={getDetailQuery.data?.name!}
                                            fill
                                            className={`object-cover bg-gray-200 rounded-sm`}
                                            sizes="100vw"
                                        />
                                    </div>
                                    <button title="Selanjutnya" onClick={onNextMusic}>
                                        <GrNext className="text-3xl" />
                                    </button>
                                </div>
                                <figure className="!w-full">
                                    <audio
                                        autoPlay
                                        key={params?.slug}
                                        controls
                                        src={params?.slug ? getDetailQuery.data?.music : undefined}
                                        className="!w-full"
                                    >
                                        <a href={getDetailQuery.data?.music}>Download</a>
                                    </audio>
                                </figure>
                            </div>
                            <div className="flex items-center justify-between mb-10 mt-5">
                                <div className="flex items-center justify-center gap-5">
                                    <LikeButton
                                        refresh={refreshDetail}
                                        count={getDetailQuery.data?.loveCount}
                                        idContent={params.slug}
                                        mode="action"
                                        type="musics"
                                    />
                                    <ViewButton count={getDetailQuery.data?.viewCount} idContent={params.slug} type="musics" />
                                    <DownloadButton
                                        path="musics"
                                        idContent={params.slug}
                                        count={getDetailQuery.data?.downloadCount}
                                        title="Didownload"
                                        variant="default"
                                        size="sm"
                                        refresh={refreshDetail}
                                        onClick={download(getDetailQuery.data)}
                                    />
                                </div>
                                <div className="flex items-center gap-5">
                                    <Button onClick={share} title="Bagikan" variant="secondary" size="sm">
                                        <PiShareFatBold className="text-gray-500 text-lg mr-3" />
                                        Bagikan
                                    </Button>
                                    {state?.user?.uid !== getDetailQuery.data?.uid && getDetailQuery.data?.komersil ? (
                                        <ShopButton chatInfo={chatInfo} />
                                    ) : null}
                                </div>
                            </div>
                            {getDetailQuery.data?.list ? (
                                <div className="mb-10">
                                    <div className="flex items-center gap-4 my-5">
                                        {getDetailQuery.data?.list?.map((ms) => (
                                            <Link href={`/m/${ms.id}`} key={ms.id}>
                                                <div
                                                    title={ms.name}
                                                    className={`relative h-[80px] w-[80px] row-span-2 bg-black rounded-full overflow-hidden`}
                                                >
                                                    <Image
                                                        src={ms.thumbnail!}
                                                        alt={ms.name!}
                                                        fill
                                                        className={`object-cover bg-gray-200 ${ms.id === params?.slug ? "opacity-50" : ""}`}
                                                        sizes="100vw"
                                                    />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="relative w-[100px] h-[100px]">
                                            <Image
                                                src={getDetailQuery.data?.albumThumbnail!}
                                                alt={getDetailQuery.data?.albumName!}
                                                fill
                                                className="object-cover bg-gray-200 rounded-sm"
                                                sizes="100vw"
                                            />
                                        </div>
                                        <h1 className="text-xl font-semibold font-poppins flex-1">
                                            Album - {getDetailQuery.data?.albumName?.CapitalizeEachFirstLetter()}
                                        </h1>
                                    </div>
                                    <div className="flex items-center text-gray-400 mb-5">
                                        <BsCalendarCheck className="!text-gray-400 mr-2" />
                                        {moment(getDetailQuery.data?.uploadDate)?.format(FORMAT_DATE)}
                                    </div>
                                    {getDetailQuery.data?.albumTag ? (
                                        <div className="flex items-center gap-4 mb-5">
                                            {getDetailQuery.data?.albumTag?.map((tag) => (
                                                <Button size="sm" variant="outline" key={tag} className="cursor-default">
                                                    {tag?.CapitalizeEachFirstLetter()}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : null}
                                    {HTMLReactParser(getDetailQuery.data?.albumLyrics || "") ? (
                                        <div className="max-h-[60vh] overflow-y-scroll scroll-custom">
                                            <span className="font-semibold text-2xl mb-2">Deskripsi</span> <br />
                                            {HTMLReactParser(getDetailQuery.data?.albumLyrics || "")}
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-semibold font-poppins">{getDetailQuery.data?.name?.CapitalizeEachFirstLetter()}</h1>
                            <div className="flex items-center text-gray-400 mb-5">
                                <BsCalendarCheck className="!text-gray-400 mr-2" />
                                {moment(getDetailQuery.data?.uploadDate)?.format(FORMAT_DATE)}
                            </div>
                            {getDetailQuery.data?.tag ? (
                                <div className="flex items-center gap-4 mb-5">
                                    {getDetailQuery.data?.tag?.map((tag) => (
                                        <Button size="sm" variant="outline" key={tag} className="cursor-default">
                                            {tag?.CapitalizeEachFirstLetter()}
                                        </Button>
                                    ))}
                                </div>
                            ) : null}
                            {HTMLReactParser(getDetailQuery.data?.lyrics || "") ? (
                                <div className="max-h-[60vh] overflow-y-scroll scroll-custom">
                                    <span className="font-semibold text-2xl mb-2">Lirik</span> <br />
                                    {HTMLReactParser(getDetailQuery.data?.lyrics || "")}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </StateRender.Data>
                <StateRender.Loading>
                    <div className="container mx-auto px-28">
                        <Skeleton active paragraph={{ rows: 3 }} />
                    </div>
                </StateRender.Loading>
                <StateRender.Error>
                    <div className="container mx-auto px-28">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{(getDetailQuery.error as any)?.message}</AlertDescription>
                        </Alert>
                    </div>
                </StateRender.Error>
            </StateRender>
        </div>
    );
}
