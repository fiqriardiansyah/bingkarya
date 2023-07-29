"use client";

import { VideosProperty } from "@/app/collection/video/page";
import DownloadButton from "@/app/components/download-button";
import LikeButton from "@/app/components/like-button";
import OwnerContent from "@/app/components/owner-content";
import ShopButton from "@/app/components/shop-button";
import ViewButton from "@/app/components/view-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import StateRender from "@/components/ui/state";
import { functionInstance } from "@/config/firebase-instance";
import { UserContext } from "@/context/user";
import { FORMAT_DATE, createChatId } from "@/lib/utils";
import { ChatInfo } from "@/models";
import { Popconfirm, Skeleton } from "antd";
import { httpsCallable } from "firebase/functions";
import HTMLReactParser from "html-react-parser";
import { AlertCircle } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { AiFillHeart, AiOutlineEye } from "react-icons/ai";
import { BsCalendarCheck } from "react-icons/bs";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { PiShareFatBold } from "react-icons/pi";
import { useQuery } from "react-query";
import { Player } from "video-react";
import "video-react/dist/video-react.css";

type PageProps = {
    params: {
        slug: string;
    };
};

const getVideoDetail = httpsCallable(functionInstance, "getVideoDetail");

export default function Page({ params }: PageProps) {
    const { state } = useContext(UserContext);
    const [heightWindow, setHeightWindow] = useState(typeof window !== "undefined" ? window?.innerHeight : 600);
    const downloadRef = useRef<HTMLAnchorElement>(null);

    const getDetailQuery = useQuery(
        ["get-detail-vid", params?.slug],
        async () => {
            return (await getVideoDetail({ id: params?.slug })).data as VideosProperty;
        },
        {
            enabled: !!params?.slug,
        }
    );

    useEffect(() => {
        setHeightWindow(window.innerHeight);
    }, []);

    const download = (video?: VideosProperty) => {
        return () => {
            if (downloadRef.current) {
                downloadRef.current.href = video?.video!;
                downloadRef.current.click();
            }
        };
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
        link: "/v/" + params?.slug,
    };

    return (
        <div className="min-h-screen mt-16">
            <a ref={downloadRef} target="_blank" download id="download" hidden></a>
            <OwnerContent uid={getDetailQuery.data?.uid} />
            <StateRender data={getDetailQuery.data} isLoading={getDetailQuery.isLoading} isError={getDetailQuery.isError}>
                <StateRender.Data>
                    <div className="relative h-fit w-full bg-black flex items-center justify-center">
                        <Player key={params.slug} height={heightWindow * 0.8} fluid={false} poster={getDetailQuery.data?.mainThumbnail}>
                            <source src={getDetailQuery.data?.video} />
                        </Player>
                    </div>
                    <div className="container mx-auto px-28">
                        <div className="flex items-center justify-between mb-10 mt-5">
                            <div className="flex items-center justify-center gap-5">
                                <LikeButton
                                    refresh={refreshDetail}
                                    count={getDetailQuery.data?.loveCount}
                                    idContent={params.slug}
                                    mode="action"
                                    type="videos"
                                />
                                <ViewButton count={getDetailQuery.data?.viewCount} idContent={params.slug} type="videos" />
                                <DownloadButton
                                    path="videos"
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
                        <div className="mb-10">
                            <h1 className="text-xl font-semibold font-poppins">{getDetailQuery.data?.name?.CapitalizeEachFirstLetter()}</h1>
                            {getDetailQuery.data?.location ? (
                                <div className="flex items-center text-gray-400 mt-5">
                                    <FaMapLocationDot className="!text-gray-400 mr-2" />
                                    {getDetailQuery.data?.location?.CapitalizeEachFirstLetter()}
                                </div>
                            ) : null}
                            <div className="flex items-center text-gray-400 mb-5">
                                <BsCalendarCheck className="!text-gray-400 mr-2" />
                                {moment(getDetailQuery.data?.uploadDate)?.format(FORMAT_DATE)}
                            </div>
                            {HTMLReactParser(getDetailQuery.data?.description || "") ? (
                                <p className="">{HTMLReactParser(getDetailQuery.data?.description || "")}</p>
                            ) : null}
                            {getDetailQuery.data?.tag ? (
                                <div className="flex items-center gap-4 mt-10">
                                    {getDetailQuery.data?.tag?.map((tag) => (
                                        <Button size="sm" variant="outline" key={tag} className="cursor-default">
                                            {tag?.CapitalizeEachFirstLetter()}
                                        </Button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                        <p className="text-gray-500 text-xl mt-10 mb-4">Cuplikan</p>
                        <div className="grid grid-cols-5 gap-5 mb-20">
                            {getDetailQuery.data?.thumbnails?.map((thumb, i) => (
                                <div className="relative h-[200px]" key={i}>
                                    <Image
                                        src={thumb}
                                        alt={getDetailQuery.data.name!}
                                        fill
                                        className="object-cover bg-gray-200 rounded-sm"
                                        sizes="100vw"
                                    />
                                </div>
                            ))}
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
