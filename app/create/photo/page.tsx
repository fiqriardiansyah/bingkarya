"use client";

import confetiAnimation from "@/animation/confeti.json";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { functionInstance } from "@/config/firebase-instance";
import { ConfigContext } from "@/context/config";
import { message } from "antd";
import { getAuth } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useContext, useState } from "react";
import Lottie from "react-lottie";
import { useMutation } from "react-query";
import { PhotoType } from "./components/photo";
import { PhotoInfoWithFile } from "./components/sidebar";
import { photosUpload } from "../lib/file-upload";
import { useRouter } from "next-nprogress-bar";

const Photos = dynamic(async () => await import("./components/photos"), {
    ssr: false,
    suspense: true,
});

const Sidebar = dynamic(async () => await import("./components/sidebar"), {
    ssr: false,
    suspense: true,
});

export interface UploadPhoto extends PhotoInfoWithFile {
    uid: any;
    photos: PhotoType[];
}

const createPhoto = httpsCallable(functionInstance, "createPhoto");

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
    const [files, setFiles] = useState<PhotoType[]>([]);
    const { notifInstance } = useContext(ConfigContext);

    const uploadMutation = useMutation(async (data: UploadPhoto) => {
        const photoWithDownloadUrl = await photosUpload(data.photos);
        const req = createPhoto({ ...data, photos: photoWithDownloadUrl });
        return req;
    });

    const onUpload = (values: PhotoInfoWithFile) => {
        if (!files?.length) {
            message.error("Silahkan pilih gambar terlebih dahulu");
            return;
        }
        if (values.type === "album" && files.length === 1) {
            message.error("Minimal 2 Gambar untuk dijadikan album");
            return;
        }
        const notCompleteInfo = files?.filter((file) => !file.completeInfo).length;
        if (notCompleteInfo) {
            message.error("Mohon lengkapi informasi gambar");
            return;
        }

        uploadMutation
            .mutateAsync({
                uid: getAuth().currentUser?.uid,
                ...values,
                photos: files,
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
                router.push("/collection/photography");
            });
    };

    return (
        <div className="min-h-screen mt-20 container mx-auto px-28 flex gap-4">
            <div className={`bg-gray-100 flex-1 ${uploadMutation.isLoading ? "blur-sm pointer-events-none" : ""} `}>
                <Suspense fallback={<h1 className="text-6xl">Loading</h1>}>
                    <Photos files={files} setFiles={setFiles} />
                </Suspense>
            </div>
            <div className="w-[500px] flex flex-col gap-4">
                <Suspense fallback={<h1>Loading</h1>}>
                    <Sidebar loading={uploadMutation.isLoading} onUpload={onUpload} />
                </Suspense>
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
