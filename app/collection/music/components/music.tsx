"use client";

import { Button } from "@/components/ui/button";
import { functionInstance } from "@/config/firebase-instance";
import { FORMAT_DATE } from "@/lib/utils";
import { Modal, Popconfirm, message } from "antd";
import { httpsCallable } from "firebase/functions";
import HTMLReactParser from "html-react-parser";
import moment from "moment";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { memo, useEffect, useRef, useState } from "react";
import { AiFillHeart, AiOutlinePlayCircle, AiOutlineShopping } from "react-icons/ai";
import { BsCalendarCheck } from "react-icons/bs";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { LuMusic4 } from "react-icons/lu";
import { PiShareFatBold } from "react-icons/pi";
import "react-jinke-music-player/assets/index.css";
import { useMutation } from "react-query";
import { MusicProperty } from "../page";

type Props = {
    music: MusicProperty;
    onDelete: () => void;
};

const deleteMusic = httpsCallable(functionInstance, "deleteMusic");

const Music = ({ music, onDelete }: Props) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const focusItem = searchParams.get("focus");

    const downloadRef = useRef<HTMLAnchorElement>(null);
    const [modal, setModal] = useState(focusItem === music?.id);

    const deleteMutation = useMutation(async () => {
        return (await deleteMusic({ id: music.id })).data;
    });

    useEffect(() => {
        setModal(focusItem === music?.id);
    }, [focusItem, music?.id]);

    const onOpenModal = () => {
        router.push(pathname + "?focus=" + music.id);
    };

    const onCloseModal = () => {
        router.push(pathname);
    };

    const download = (music: MusicProperty) => {
        return () => {
            if (downloadRef.current) {
                downloadRef.current.href = music.music!;
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
                if (focusItem === music?.id) {
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
                title: music?.name?.CapitalizeEachFirstLetter(),
                text: "Coba cek karya ini! \n " + music?.name,
                url: window.location.href.toString(),
            });
        }
    };

    return (
        <>
            <a ref={downloadRef} target="_blank" download id="download" hidden></a>
            <Modal title={music?.name?.CapitalizeEachFirstLetter()} width="90vw" footer={null} centered open={modal} onCancel={onCloseModal}>
                <div className="flex">
                    <div className="flex-1 px-10">
                        <div className="relative w-full flex flex-col items-center">
                            <div className="relative w-[300px] h-[300px] rounded-full overflow-hidden mb-10">
                                <Image
                                    src={music.thumbnail!}
                                    alt={music.name!}
                                    fill
                                    className={`object-cover bg-gray-200 rounded-sm`}
                                    sizes="100vw"
                                />
                            </div>
                            <figure className="!w-full">
                                <audio key={focusItem} controls src={music?.music} className="!w-full">
                                    <a href={music?.music}>Download</a>
                                </audio>
                            </figure>
                        </div>
                        <div className="flex items-center justify-between mb-10 mt-5">
                            <div className="flex items-center justify-center gap-5">
                                <Button title="Disukai" variant="secondary" size="sm" className="cursor-default">
                                    <AiFillHeart className="text-gray-500 text-lg mr-3" />
                                    {music?.loveCount?.length || 0}
                                </Button>
                                <Button title="Diputar" variant="secondary" size="sm" className="cursor-default">
                                    <AiOutlinePlayCircle className="text-gray-500 text-lg mr-3" />
                                    {music?.viewCount?.length || 0}
                                </Button>
                                <Button title="Didownload" variant="secondary" size="sm" onClick={download(music)}>
                                    <FaCloudDownloadAlt className="text-gray-500 text-lg mr-3" />
                                    {music?.downloadCount || 0}
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
                                    title={"Hapus " + music?.name}
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
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-semibold font-poppins">{music?.name?.CapitalizeEachFirstLetter()}</h1>
                        <div className="flex items-center text-gray-400 mb-5">
                            <BsCalendarCheck className="!text-gray-400 mr-2" />
                            {moment(music.uploadDate)?.format(FORMAT_DATE)}
                        </div>
                        {music?.tag ? (
                            <div className="flex items-center gap-4 mb-5">
                                {music?.tag?.map((tag) => (
                                    <Button size="sm" variant="outline" key={tag} className="cursor-default">
                                        {tag?.CapitalizeEachFirstLetter()}
                                    </Button>
                                ))}
                            </div>
                        ) : null}
                        {HTMLReactParser(music?.lyrics || "") ? (
                            <div className="max-h-[60vh] overflow-y-scroll scroll-custom">
                                <span className="font-semibold text-2xl mb-2">Lirik</span> <br />
                                {HTMLReactParser(music?.lyrics || "")}
                            </div>
                        ) : null}
                    </div>
                </div>
            </Modal>
            <div className={deleteMutation.isLoading ? "opacity-20" : ""}>
                <button className="relative h-[200px] w-full group" onClick={onOpenModal} title={music.name}>
                    {music.komersil ? (
                        <div
                            title="Musik untuk komersial"
                            className="bg-gray-900 flex items-center justify-center w-8 h-8 rounded-full absolute top-3 left-3 z-10 shadow-md text-white"
                        >
                            <AiOutlineShopping className="text-white text-lg" />
                        </div>
                    ) : null}
                    <div className="group-hover:block hidden bg-black opacity-50 w-full h-full z-10 absolute top-0 left-0 pointer-events-none"></div>
                    <LuMusic4 className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10 text-9xl text-white opacity-80 drop-shadow-2xl" />
                    <Image src={music.thumbnail!} alt={music.name!} fill className="object-cover bg-gray-200 rounded-sm" sizes="100vw" />
                </button>
                <p title={music.name} className="m-0 font-light font-poppins line-clamp-1">
                    {music?.name?.CapitalizeEachFirstLetter()}
                </p>
            </div>
        </>
    );
};

export default memo(Music);
