"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { functionInstance } from "@/config/firebase-instance";
import { message } from "antd";
import { getAuth } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { AlertCircle } from "lucide-react";
import { useContext, useState } from "react";
import { useMutation } from "react-query";
import confetiAnimation from "@/animation/confeti.json";
import { fileUploadByte, musicsUpload } from "../lib/file-upload";
import { MusicType } from "./components/music";
import Musics from "./components/musics";
import Sidebar, { MusicInfoWithFile } from "./components/sidebar";
import Lottie from "react-lottie";
import { ConfigContext } from "@/context/config";
import { useRouter } from "next-nprogress-bar";

export interface UploadMusic extends MusicInfoWithFile {
    music: MusicType[];
}
const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: confetiAnimation,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

const createMusic = httpsCallable(functionInstance, "createMusic");

export default function Page() {
    const router = useRouter();
    const { notifInstance } = useContext(ConfigContext);
    const [files, setFiles] = useState<MusicType[]>([]);

    const uploadMutation = useMutation(async (data: UploadMusic & { uid: any; name?: any }) => {
        const uploadMusic = await musicsUpload(data.music as any[]);
        let albumThumbnailUrl;
        if (data.type === "album") {
            albumThumbnailUrl = await fileUploadByte({ file: data.thumbnail!, name: data.name, path: "thumbnails" });
        }
        const tData = {
            music: uploadMusic,
            name: data?.name,
            tag: data?.tag,
            lyrics: data?.lyrics,
            thumbnail: albumThumbnailUrl,
            type: data.type,
            uid: data?.uid,
            komersil: data?.komersil,
        };

        const req = await createMusic(tData);

        return req;
    });

    const onUpload = (values: MusicInfoWithFile) => {
        if (!files?.length) {
            message.error("Silahkan pilih file audio terlebih dahulu");
            return;
        }
        const notCompleteInfo = files?.filter((file) => !file.completeInfo).length;
        if (notCompleteInfo) {
            message.error("Mohon lengkapi informasi audio");
            return;
        }

        uploadMutation
            .mutateAsync({
                uid: getAuth().currentUser?.uid,
                ...values,
                music: files,
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
                router.push("/collection/music");
            });
    };

    return (
        <div className="min-h-screen mt-20 container mx-auto px-28 flex gap-4">
            <div className={`bg-gray-100 flex-1 ${uploadMutation.isLoading ? "blur-md pointer-events-none" : ""}`}>
                <Musics files={files} setFiles={setFiles} />
            </div>
            <div className="w-[400px]">
                <Sidebar loading={uploadMutation.isLoading} onUpload={onUpload} />
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
