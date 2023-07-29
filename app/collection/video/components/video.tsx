"use client";

import { Button } from "@/components/ui/button";
import { FORMAT_DATE } from "@/lib/utils";
import { Modal, Popconfirm, message } from "antd";
import HTMLReactParser from "html-react-parser";
import moment from "moment";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { memo, useEffect, useRef, useState } from "react";
import { AiFillHeart, AiOutlineEye, AiOutlineShopping } from "react-icons/ai";
import { BsCalendarCheck } from "react-icons/bs";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { MdSlowMotionVideo } from "react-icons/md";
import { PiShareFatBold } from "react-icons/pi";
import { Player } from "video-react";
import "video-react/dist/video-react.css";
import { VideosProperty } from "../page";
import { httpsCallable } from "firebase/functions";
import { functionInstance } from "@/config/firebase-instance";
import { useMutation } from "react-query";

type Props = {
    video: VideosProperty;
    onDelete: () => void;
};

const deleteVideo = httpsCallable(functionInstance, "deleteVideo");

const Video = ({ video, onDelete }: Props) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const focusItem = searchParams.get("focus");

    const downloadRef = useRef<HTMLAnchorElement>(null);
    const [modal, setModal] = useState(false);
    const [heightWindow, setHeightWindow] = useState(window?.innerHeight || 600);

    const deleteMutation = useMutation(async () => {
        return (await deleteVideo({ id: video.id })).data;
    });

    useEffect(() => {
        setModal(focusItem === video?.id);
        setHeightWindow(window.innerHeight);
    }, [focusItem, video?.id]);

    const onOpenModal = () => {
        router.push(pathname + "?focus=" + video.id);
    };

    const onCloseModal = () => {
        router.push(pathname);
    };

    const download = (video: VideosProperty) => {
        return () => {
            if (downloadRef.current) {
                downloadRef.current.href = video.video!;
                downloadRef.current.click();
            }
        };
    };

    const onConfirmDelete = () => {
        deleteMutation
            .mutateAsync()
            .then(() => {
                message.success("Data berhasil dihapus");
                onDelete();
                if (focusItem === video?.id) {
                    router.back();
                }
            })
            .catch((e: any) => {
                message.error(e?.message);
            });
    };

    const share = () => {
        if (navigator && typeof window !== "undefined") {
            navigator.share({
                title: video?.name?.CapitalizeEachFirstLetter(),
                text: "Coba cek karya ini! \n " + video?.name,
                url: window.location.href.toString(),
            });
        }
    };

    return (
        <>
            <a ref={downloadRef} target="_blank" download id="download" hidden></a>
            <Modal title={video?.name?.CapitalizeEachFirstLetter()} width="90vw" footer={null} centered open={modal} onCancel={onCloseModal}>
                <div className="relative h-fit w-full bg-black flex items-center justify-center">
                    {modal ? (
                        <Player key={focusItem} height={heightWindow * 0.8} fluid={false} poster={video.mainThumbnail}>
                            <source src={video.video} />
                        </Player>
                    ) : null}
                </div>
                <p className="text-gray-500 text-xl mt-10 mb-4">Cuplikan</p>
                <div className="grid grid-cols-5 gap-5">
                    {video?.thumbnails?.map((thumb, i) => (
                        <div className="relative h-[200px]" key={i}>
                            <Image src={thumb} alt={video.name!} fill className="object-cover bg-gray-200 rounded-sm" sizes="100vw" />
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between mb-10 mt-5">
                    <div className=""></div>
                    <div className="flex items-center justify-center gap-5">
                        <Button title="Disukai" variant="secondary" size="sm" className="cursor-default">
                            <AiFillHeart className="text-gray-500 text-lg mr-3" />
                            {video?.loveCount?.length || 0}
                        </Button>
                        <Button title="Dilihat" variant="secondary" size="sm" className="cursor-default">
                            <AiOutlineEye className="text-gray-500 text-lg mr-3" />
                            {video?.viewCount?.length || 0}
                        </Button>
                        <Button title="Didownload" variant="secondary" size="sm" onClick={download(video)}>
                            <FaCloudDownloadAlt className="text-gray-500 text-lg mr-3" />
                            {video?.downloadCount || 0}
                        </Button>
                    </div>
                    <div className="flex items-center gap-5">
                        <Button onClick={share} title="Bagikan" variant="secondary" size="sm">
                            <PiShareFatBold className="text-gray-500 text-lg mr-3" />
                            Bagikan
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button disabled variant="link" size="sm">
                            Edit
                        </Button>
                        <Popconfirm
                            title={"Hapus " + video?.name}
                            description="Apa kamu ingin melanjutkan?"
                            okButtonProps={{ className: "bg-black" }}
                            showCancel={false}
                            onConfirm={onConfirmDelete}
                        >
                            <Button variant="link" size="sm" className="text-red-500" disabled={deleteMutation.isLoading}>
                                {deleteMutation.isLoading ? "Sedang menghapus" : "Hapus"}
                            </Button>
                        </Popconfirm>
                    </div>
                </div>
                <div className="mb-10">
                    <h1 className="text-xl font-semibold font-poppins">{video?.name?.CapitalizeEachFirstLetter()}</h1>
                    {video?.location ? (
                        <div className="flex items-center text-gray-400 mt-5">
                            <FaMapLocationDot className="!text-gray-400 mr-2" />
                            {video?.location?.CapitalizeEachFirstLetter()}
                        </div>
                    ) : null}
                    <div className="flex items-center text-gray-400 mb-5">
                        <BsCalendarCheck className="!text-gray-400 mr-2" />
                        {moment(video.uploadDate)?.format(FORMAT_DATE)}
                    </div>
                    {HTMLReactParser(video?.description || "") ? <p className="">{HTMLReactParser(video?.description || "")}</p> : null}
                    {video?.tag ? (
                        <div className="flex items-center gap-4 mt-10">
                            {video?.tag?.map((tag) => (
                                <Button size="sm" variant="outline" key={tag} className="cursor-default">
                                    {tag?.CapitalizeEachFirstLetter()}
                                </Button>
                            ))}
                        </div>
                    ) : null}
                </div>
            </Modal>
            <div className={deleteMutation.isLoading ? "opacity-20" : ""}>
                <button className="relative h-[300px] w-full group" onClick={onOpenModal}>
                    {video.komersil ? (
                        <div
                            title="Video untuk komersial"
                            className="bg-gray-900 flex items-center justify-center w-8 h-8 rounded-full absolute top-3 left-3 z-10 shadow-md text-white"
                        >
                            <AiOutlineShopping className="text-white text-lg" />
                        </div>
                    ) : null}
                    <div className="group-hover:block hidden bg-black opacity-50 w-full h-full z-10 absolute top-0 left-0 pointer-events-none"></div>
                    <MdSlowMotionVideo className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10 text-9xl text-white opacity-80" />
                    <Image src={video.mainThumbnail!} alt={video.name!} fill className="object-cover bg-gray-200 rounded-sm" sizes="100vw" />
                </button>
                <p title={video.name} className="m-0 font-light font-poppins line-clamp-1">
                    {video?.name?.CapitalizeEachFirstLetter()}
                </p>
            </div>
        </>
    );
};

export default memo(Video);
