"use client";

import { Suspense, useContext, useEffect, useState } from "react";
import Sidebar, { VideoInfoWithFile } from "./components/sidebar";
import dynamic from "next/dynamic";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import Image from "next/image";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useMutation } from "react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fileUploadByte, thumbnailsUploadString } from "../lib/file-upload";
import { httpsCallable } from "firebase/functions";
import { functionInstance } from "@/config/firebase-instance";
import { getAuth } from "firebase/auth";
import confetiAnimation from "@/animation/confeti.json";
import { ConfigContext } from "@/context/config";
import Lottie from "react-lottie";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next-nprogress-bar";

const Video = dynamic(async () => await import("./components/video"), {
    ssr: false,
    suspense: true,
});
const THUMBNAIL_GENERATE = 15;
const MAX_THUMBNAIL = 5;

const createVideo = httpsCallable(functionInstance, "createVideo");

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: confetiAnimation,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

export default function Page() {
    const router = useRouter();
    const { notifInstance } = useContext(ConfigContext);

    const [file, setFile] = useState<File | null>();
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [pickThumbnails, setPickThumbnails] = useState<any[]>([]);
    const [thumbLoading, setThumbLoading] = useState(false);

    const uploadMutation = useMutation(async (data: VideoInfoWithFile & { uid: any }) => {
        const videoWithDownloadUrl = await fileUploadByte({ file: file!, name: file?.name, path: "videos" });
        const thumbnailsWithDownloadUrl = await thumbnailsUploadString(thumbnails.filter((_, i) => pickThumbnails.includes(i)));
        const mainThumbnailWithDownloadUrl = await fileUploadByte({ file: data.thumbnail!, name: data?.name, path: "thumbnails" });
        const req = await createVideo({
            name: data?.name,
            description: data?.description,
            tag: data?.tag,
            location: data?.location,
            urlVideo: videoWithDownloadUrl,
            thumbnails: thumbnailsWithDownloadUrl,
            mainThumbnail: mainThumbnailWithDownloadUrl,
            uid: data?.uid,
            komersil: data?.komersil,
        });
        return req;
    });

    useEffect(() => {
        if (file) {
            setThumbLoading(true);
            generateVideoThumbnails(file, THUMBNAIL_GENERATE, file.type).then((thumbs) => {
                setThumbnails(thumbs);
                setThumbLoading(false);
            });
        } else {
            setThumbnails([]);
            setPickThumbnails([]);
        }
    }, [file]);

    const onClickThumbnails = (index: any) => {
        setPickThumbnails((prev) => {
            if (prev?.includes(index)) {
                return prev?.filter((item) => item !== index);
            }
            if (prev.length >= MAX_THUMBNAIL) return prev;
            return [...prev, index];
        });
    };

    const onUpload = (values: VideoInfoWithFile) => {
        uploadMutation
            .mutateAsync({
                uid: getAuth().currentUser?.uid,
                ...values,
            })
            .then(() => {
                notifInstance?.success({
                    message: "Berhasil mengunggah hasil karya kamu!",
                    description: (
                        <Lottie options={defaultOptions} height={200} width={200} isClickToPauseDisabled={false} style={{ pointerEvents: "none" }} />
                    ),
                    placement: "bottomRight",
                    duration: 0,
                });
                router.push("/collection/video");
            });
    };

    return (
        <div className="min-h-screen mt-20 container mx-auto px-28 flex gap-4">
            <div className={`bg-gray-100 flex-1 h-fit flex flex-col gap-4 ${uploadMutation.isLoading ? "blur-sm pointer-events-none" : ""}`}>
                <Suspense fallback={<h1 className="text-6xl">Loading</h1>}>
                    <Video file={file} setFile={setFile} />
                </Suspense>
                {thumbLoading ? (
                    <div className="flex items-center justify-center bg-gray-900 p-2">
                        <Spin size="large" indicator={<LoadingOutlined className="text-white mr-5" style={{ fontSize: 20 }} spin />} />
                        <span className="text-white">Membuat Thumbnails</span>
                    </div>
                ) : null}
                {thumbnails?.length ? (
                    <div className="p-3">
                        <p className="m-0 font-poppins mb-4">Pilih Cuplikan (Max {MAX_THUMBNAIL})</p>
                        <div className="grid grid-cols-4 gap-4">
                            {thumbnails.map((item, i) => (
                                <button
                                    disabled={pickThumbnails.length >= MAX_THUMBNAIL && !pickThumbnails?.includes(i)}
                                    onClick={() => onClickThumbnails(i)}
                                    className={`relative h-[100px] hover:opacity-100 ${
                                        pickThumbnails?.includes(i) ? "border-solid border-2 border-gray-800" : "opacity-60"
                                    }`}
                                    key={i}
                                >
                                    <Image src={item} alt={`Thumbnail ${i + 1}`} className="bg-gray-200 object-contain" fill />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
            <div className="flex-1 flex flex-col gap-5">
                <Sidebar onUpload={onUpload} name={file?.name} loading={uploadMutation.isLoading} />
                {uploadMutation.isError ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{(uploadMutation.error as any)?.message}</AlertDescription>
                    </Alert>
                ) : null}
            </div>
        </div>
    );
}
