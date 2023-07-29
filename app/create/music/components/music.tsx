import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, UploadFile } from "antd";
import Image from "next/image";
import { BiMessageAltEdit } from "react-icons/bi";
import { TiDeleteOutline } from "react-icons/ti";
import AlbumForm from "./album-form";
import { useState } from "react";
import { SiApplemusic } from "react-icons/si";
import { PiWarningCircleBold } from "react-icons/pi";

export interface MusicInfo {
    lyrics?: string;
    thumbnail?: File;
    tag?: string[];
}

export interface MusicType extends UploadFile, MusicInfo {
    completeInfo?: boolean;
}

type Props = {
    music: MusicType;
    onDelete: (music: MusicType) => void;
    onEdit: (music: MusicType) => void;
};

export default function Music({ music, onDelete, onEdit }: Props) {
    const [modal, setModal] = useState(false);

    const defaultValues = {
        name: music?.name,
        tag: music?.tag || [],
        lyrics: music?.lyrics,
        thumbnail: music?.thumbnail,
    };

    return (
        <div className="relative rounded-full bg-white flex items-center justify-between py-3 px-5">
            <div className="flex items-center gap-4">
                {music?.thumbnail ? (
                    <Image
                        width={50}
                        height={50}
                        className="object-cover rounded-full bg-gray-300 w-[50px] h-[50px]"
                        src={URL.createObjectURL(music.thumbnail as any)}
                        alt={music.name}
                    />
                ) : (
                    <SiApplemusic className="text-4xl text-gray-800" />
                )}
                <p className="m-0 text-sm leading-none max-w-[150px] line-clamp-2">{music.name?.CapitalizeEachFirstLetter()}</p>
            </div>
            <figure className="">
                <audio controls src={URL.createObjectURL(music.originFileObj as File)}>
                    <a href={URL.createObjectURL(music.originFileObj as File)}>Download</a>
                </audio>
            </figure>
            <div className="flex items-center gap-4">
                {!music?.completeInfo ? (
                    <Tooltip title="Mohon lengkapi informasi" color="red">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-white">
                            <PiWarningCircleBold className="text-red-400 text-2xl" />
                        </div>
                    </Tooltip>
                ) : null}
                <div className="px-2 py-1 shadow-md z-10 flex items-center justify-center bg-white rounded-full gap-x-3">
                    <Dialog open={modal} onOpenChange={setModal}>
                        <DialogTrigger asChild>
                            <button onClick={() => setModal(true)} title="Edit informasi" className="cursor-pointer hover:opacity-70">
                                <BiMessageAltEdit className="text-gray-700 text-2xl" />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-scroll scroll-custom">
                            <DialogHeader>
                                <div className="flex gap-3">
                                    <div className="w-[50px] h-[50px] relative bg-white shadow-md rounded flex items-center justify-center">
                                        <SiApplemusic className="text-3xl text-gray-800" />
                                    </div>
                                    <div className="flex-1">
                                        <DialogTitle>Informasi lengkap</DialogTitle>
                                        <DialogDescription>Mudahkan orang lain untuk mengetahui informasi musik kamu</DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>
                            <AlbumForm
                                defaultValues={defaultValues}
                                onSubmit={(values) => {
                                    setModal(false);
                                    onEdit({ ...music, ...values, completeInfo: !!values.name && !!values.thumbnail });
                                }}
                                buttonSave={
                                    <Button type="submit" className="mt-10">
                                        Simpan Informasi
                                    </Button>
                                }
                            />
                        </DialogContent>
                    </Dialog>
                    <button onClick={() => onDelete(music)} title="Hapus" className="cursor-pointer hover:opacity-70">
                        <TiDeleteOutline className="text-red-500 text-2xl" />
                    </button>
                </div>
            </div>
        </div>
    );
}
