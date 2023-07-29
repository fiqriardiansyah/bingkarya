"use client";

import { message } from "antd";
import React, { Dispatch, SetStateAction, memo } from "react";
import { TfiVideoClapper } from "react-icons/tfi";
import { TiDeleteOutline } from "react-icons/ti";

const MEGABYTES = 1024 * 1024;
const MAX_SIZE = 150;

type Props = {
    file: File | null | undefined;
    setFile: Dispatch<SetStateAction<File | null | undefined>>;
};

const Video = ({ file, setFile }: Props) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: any) => {
        const file = event.target.files[0];
        if (file.size > MAX_SIZE * MEGABYTES) {
            message.error(`Ukuran file tidak boleh lebih dari ${MAX_SIZE}MB`);
            return;
        }
        setFile(file);
    };

    const handleChoose = (event: any) => {
        inputRef?.current?.click();
    };

    const handleDelete = () => {
        setFile(null);
        if (inputRef?.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className="relative">
            {file ? (
                <div className="px-2 py-1 shadow-md z-10 flex items-center justify-center absolute bottom-1/2 -translate-y-1/2 right-1 bg-white rounded-full gap-x-3">
                    <button onClick={handleDelete} title="Hapus" className="cursor-pointer hover:opacity-70">
                        <TiDeleteOutline className="text-red-500 text-2xl" />
                    </button>
                </div>
            ) : null}
            <input ref={inputRef} className="w-0 h-0 opacity-0 hidden" type="file" onChange={handleFileChange} accept=".mov,.mp4" />
            {!file ? (
                <button className="w-full h-[400px] flex flex-col items-center justify-center" onClick={handleChoose}>
                    <TfiVideoClapper className="text-gray-950 text-7xl" />
                    <p className="m-0 font-poppins text-sm mt-7 font-semibold">Klik untuk pilih file</p>
                    <p className="m-0 font-poppins font-light text-sm mt-1">Ukuran file saat ini tidak boleh lebih dari {MAX_SIZE}MB</p>
                </button>
            ) : null}
            {file ? (
                <div className="max-h-[400px] overflow-hidden flex items-center justify-center">
                    <video className="h-[400px]" height="400px" controls src={URL.createObjectURL(file)} />
                </div>
            ) : null}
        </div>
    );
};

export default memo(Video);
