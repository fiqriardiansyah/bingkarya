"use client";

import Dragger from "antd/es/upload/Dragger";
import { Upload, UploadProps, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { Dispatch, SetStateAction } from "react";
import Photo, { PhotoType } from "./photo";

export interface Props {
    files: PhotoType[];
    setFiles: Dispatch<SetStateAction<PhotoType[]>>;
}

const MAX_PHOTOS = 10;

export default function Photos({ files, setFiles }: Props) {
    const props: UploadProps = {
        name: "images",
        multiple: true,
        onChange(info) {
            const file = info.file;
            setFiles((prev) => {
                if (prev?.find((item) => item.uid === file.uid)) return prev;
                if (prev.length >= MAX_PHOTOS) return prev;
                return [
                    ...prev,
                    {
                        ...file,
                        completeInfo: false,
                    },
                ];
            });
        },
        beforeUpload: (file) => {
            const allowType = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
            const isAllowType = allowType.indexOf(file.type) !== -1;
            if (!isAllowType) {
                message.error(`${file.name} hanya upload file bertipe PNG, JPG, JPEG atau WEBP`);
            }
            return isAllowType || Upload.LIST_IGNORE;
        },
        showUploadList: false,
        accept: "image/png, image/jpeg, image/jpg, image/webp",
        maxCount: MAX_PHOTOS,
    };

    const onDelete = (photo: PhotoType) => {
        setFiles((prev) => prev?.filter((item) => item.uid !== photo.uid));
    };

    const onEditSubmit = (photo: PhotoType) => {
        setFiles((prev) => prev?.map((item) => (item.uid === photo.uid ? { ...item, ...photo } : item)));
    };

    return (
        <>
            {!files?.length ? (
                <Dragger {...props}>
                    <p className="text-gray-800 text-7xl">
                        <InboxOutlined className="" />
                    </p>
                    <p className="m-0 font-poppins text-sm mt-7 font-semibold">Klik atau dorong file</p>
                    <p className="m-0 font-poppins font-light text-sm">kamu bisa memasukkan maximal {MAX_PHOTOS} gambar untuk sekarang</p>
                </Dragger>
            ) : (
                <div className="grid grid-cols-3 gap-4 p-3">
                    {files.length < MAX_PHOTOS ? (
                        <Dragger {...props}>
                            <p className="text-gray-800 text-5xl">
                                <InboxOutlined className="" />
                            </p>
                            <p className="m-0 font-poppins text-sm mt-7 font-semibold">Klik atau dorong file</p>
                            <p className="m-0 font-poppins font-light text-sm">kamu bisa memasukkan maximal {MAX_PHOTOS} gambar untuk sekarang</p>
                        </Dragger>
                    ) : null}
                    {files?.map((file) => (
                        <Photo onEdit={onEditSubmit} onDelete={onDelete} photo={file} key={file.uid} />
                    ))}
                </div>
            )}
        </>
    );
}
