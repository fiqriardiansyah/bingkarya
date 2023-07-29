"use client";

import { InboxOutlined } from "@ant-design/icons";
import { UploadProps } from "antd";
import Dragger from "antd/es/upload/Dragger";
import { Dispatch, SetStateAction } from "react";
import Music, { MusicType } from "./music";

export interface Props {
    files: MusicType[];
    setFiles: Dispatch<SetStateAction<MusicType[]>>;
}

const MAX_MUSIC = 5;
export default function Musics({ files, setFiles }: Props) {
    const props: UploadProps = {
        name: "musics",
        multiple: true,
        onChange(info) {
            const file = info.file;
            setFiles((prev) => {
                if (prev?.find((item) => item.uid === file.uid)) return prev;
                if (prev.length >= MAX_MUSIC) return prev;
                return [
                    ...prev,
                    {
                        ...file,
                        completeInfo: false,
                    },
                ];
            });
        },
        showUploadList: false,
        accept: ".mp3,audio/*",
        maxCount: MAX_MUSIC,
    };

    const onDelete = (music: MusicType) => {
        setFiles((prev) => prev?.filter((item) => item.uid !== music.uid));
    };

    const onEditSubmit = (music: MusicType) => {
        setFiles((prev) => prev?.map((item) => (item.uid === music.uid ? { ...item, ...music } : item)));
    };

    return (
        <>
            {!files?.length ? (
                <Dragger {...props}>
                    <p className="text-gray-800 text-7xl">
                        <InboxOutlined className="" />
                    </p>
                    <p className="m-0 font-poppins text-sm mt-7 font-semibold">Klik atau dorong file</p>
                    <p className="m-0 font-poppins font-light text-sm">kamu bisa memasukkan maximal {MAX_MUSIC} musik untuk sekarang</p>
                </Dragger>
            ) : (
                <div className="flex flex-col gap-4 p-4">
                    {files.length < MAX_MUSIC ? (
                        <Dragger {...props}>
                            <p className="text-gray-800 text-5xl">
                                <InboxOutlined className="" />
                            </p>
                            <p className="m-0 font-poppins text-sm mt-7 font-semibold">Klik atau dorong file</p>
                            <p className="m-0 font-poppins font-light text-sm">kamu bisa memasukkan maximal {MAX_MUSIC} musik untuk sekarang</p>
                        </Dragger>
                    ) : null}
                    {files?.map((file) => (
                        <Music onEdit={onEditSubmit} onDelete={onDelete} music={file} key={file.uid} />
                    ))}
                </div>
            )}
        </>
    );
}
