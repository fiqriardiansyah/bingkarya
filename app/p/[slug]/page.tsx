"use client";

import { PhotosProperty } from "@/app/collection/photography/page";
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
import { Skeleton } from "antd";
import { httpsCallable } from "firebase/functions";
import HTMLReactParser from "html-react-parser";
import { AlertCircle } from "lucide-react";
import moment from "moment";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import Link from "next/link";
import { useContext, useRef } from "react";
import { AiOutlineShopping } from "react-icons/ai";
import { BsCalendarCheck } from "react-icons/bs";
import { FaMapLocationDot } from "react-icons/fa6";
import { GrNext, GrPrevious } from "react-icons/gr";
import { PiShareFatBold } from "react-icons/pi";
import { useQuery } from "react-query";

type PageProps = {
    params: {
        slug: string;
    };
};

const getPhotoDetail = httpsCallable(functionInstance, "getPhotoDetail");

export default function Page({ params }: PageProps) {
    const { state } = useContext(UserContext);
    const downloadRef = useRef<HTMLAnchorElement>(null);
    const router = useRouter();

    const getDetailQuery = useQuery(
        ["get-detail-vid", params?.slug],
        async () => {
            return (await getPhotoDetail({ id: params?.slug })).data as PhotosProperty & { list: PhotosProperty[] };
        },
        {
            enabled: !!params?.slug,
        }
    );

    const currIndex = getDetailQuery.data?.list ? getDetailQuery.data.list.findIndex((m) => m.id === params.slug) : 0;

    const download = (photo?: PhotosProperty) => {
        return () => {
            if (downloadRef.current) {
                downloadRef.current.href = photo?.image!;
                downloadRef.current.click();
            }
        };
    };

    const onNextPhoto = () => {
        if (!getDetailQuery.data?.list) return;
        const nextId = currIndex !== getDetailQuery.data.list.length - 1 ? currIndex + 1 : 0;
        router.push("/p/" + getDetailQuery.data.list[nextId]?.id);
    };

    const onPrevPhoto = () => {
        if (!getDetailQuery.data?.list) return;
        const nextId = currIndex !== 0 ? currIndex - 1 : getDetailQuery.data.list.length - 1;
        router.push("/p/" + getDetailQuery.data.list[nextId]?.id);
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
        link: "/p/" + params?.slug,
    };

    return (
        <div className="min-h-screen mt-16">
            <a ref={downloadRef} target="_blank" download id="download" hidden></a>
            <OwnerContent uid={getDetailQuery.data?.uid} />
            <StateRender data={getDetailQuery.data} isLoading={getDetailQuery.isLoading} isError={getDetailQuery.isError}>
                <StateRender.Data>
                    <div className="container mx-auto px-28 mb-20">
                        {getDetailQuery.data?.list ? (
                            <div className="flex items-center">
                                <button title="Sebelumnya" onClick={onPrevPhoto}>
                                    <GrPrevious className="text-3xl" />
                                </button>
                                <div className="relative w-full min-h-[600px]">
                                    <Image
                                        src={getDetailQuery.data?.image!}
                                        alt={getDetailQuery.data?.name!}
                                        fill
                                        className="object-contain rounded-sm"
                                        sizes="100vw"
                                    />
                                </div>
                                <button title="Selanjutnya" onClick={onNextPhoto}>
                                    <GrNext className="text-3xl" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative w-full min-h-[600px]">
                                <Image
                                    src={getDetailQuery.data?.image!}
                                    alt={getDetailQuery.data?.name!}
                                    fill
                                    className="object-contain rounded-sm"
                                    sizes="100vw"
                                />
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-10 mt-5">
                            <div className="flex items-center justify-center gap-5">
                                <LikeButton
                                    refresh={refreshDetail}
                                    count={getDetailQuery.data?.loveCount}
                                    idContent={params.slug}
                                    mode="action"
                                    type="photos"
                                />
                                <ViewButton count={getDetailQuery.data?.viewCount} idContent={params.slug} type="photos" />
                                <DownloadButton
                                    path="photos"
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
                        <div className="mb-5">
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

                        {getDetailQuery.data?.list ? (
                            <div className="p-4 rounded border-2 border-solid border-gray-300">
                                <div className="mb-10">
                                    <h1 className="text-xl font-semibold font-poppins">
                                        Album {getDetailQuery.data?.albumName?.CapitalizeEachFirstLetter()}
                                    </h1>
                                    {getDetailQuery.data?.albumLocation ? (
                                        <div className="flex items-center text-gray-400 mt-5">
                                            <FaMapLocationDot className="!text-gray-400 mr-2" />
                                            {getDetailQuery.data?.albumLocation?.CapitalizeEachFirstLetter()}
                                        </div>
                                    ) : null}
                                    {HTMLReactParser(getDetailQuery.data?.albumDescription || "") ? (
                                        <p className="">{HTMLReactParser(getDetailQuery.data?.albumDescription || "")}</p>
                                    ) : null}
                                    {getDetailQuery.data?.albumTag ? (
                                        <div className="flex items-center gap-4 mt-10">
                                            {getDetailQuery.data?.albumTag?.map((tag) => (
                                                <Button size="sm" variant="outline" key={tag} className="cursor-default">
                                                    {tag?.CapitalizeEachFirstLetter()}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                                <div className="grid grid-cols-4 gap-4 mb-">
                                    {getDetailQuery.data?.list?.map((pt) => (
                                        <Link href={`/p/${pt.id}`} key={pt.id}>
                                            <div className={`relative h-[200px] w-full row-span-2 bg-black rounded-sm`}>
                                                <Image
                                                    src={pt.image!}
                                                    alt={pt.name!}
                                                    fill
                                                    className={`object-cover bg-gray-200 rounded-sm ${pt.id === params?.slug ? "opacity-50" : ""}`}
                                                    sizes="100vw"
                                                />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : null}
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
