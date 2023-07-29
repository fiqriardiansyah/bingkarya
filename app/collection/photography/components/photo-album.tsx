import Image from "next/image";
import { memo } from "react";
import { PhotosProperty } from "../page";

import { useEffect, useRef, useState } from "react";
import { Modal, Popconfirm, Tag, message } from "antd";
import { FaMapLocationDot } from "react-icons/fa6";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import HTMLReactParser from "html-react-parser";
import { BsCalendarCheck } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { AiOutlineEye, AiOutlineShopping } from "react-icons/ai";
import { PiShareFatBold } from "react-icons/pi";
import moment from "moment";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import { AiFillHeart } from "react-icons/ai";
import { FORMAT_DATE } from "@/lib/utils";
import Link from "next/link";
import { useMutation } from "react-query";
import { httpsCallable } from "firebase/functions";
import { functionInstance } from "@/config/firebase-instance";

type Props = {
    photos: PhotosProperty[];
    onDelete: () => void;
};

const deletePhoto = httpsCallable(functionInstance, "deletePhoto");

const PhotoAlbum = ({ photos, onDelete }: Props) => {
    const maxShowPhoto = photos?.length > 4 ? 4 : photos.length;

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const focusItem = searchParams.get("focus");

    const downloadRef = useRef<HTMLAnchorElement>(null);
    const [modal, setModal] = useState(false);

    const indexPhoto = photos.findIndex((pt) => pt.id === focusItem);
    const photo = photos[indexPhoto !== -1 ? indexPhoto : 0];

    const deleteMutation = useMutation(async () => {
        return (await deletePhoto({ id: photo.id })).data;
    });

    useEffect(() => {
        if (!focusItem && modal) {
            setModal(false);
            return;
        }
        if (focusItem && indexPhoto !== -1 && !modal) {
            setModal(true);
        }
    }, [focusItem]);

    const onOpenModal = () => {
        router.push(pathname + "?focus=" + photo?.id);
        setModal(true);
    };

    const onCloseModal = () => {
        router.push(pathname);
        setModal(false);
    };

    const download = (photo?: PhotosProperty | null) => {
        return () => {
            if (downloadRef.current) {
                downloadRef.current.href = photo?.image || "";
                downloadRef.current.click();
            }
        };
    };

    const onNextImage = () => {
        const nextId = indexPhoto !== photos.length - 1 ? indexPhoto + 1 : 0;
        router.push(pathname + "?focus=" + photos[nextId]?.id);
    };

    const onPrevImage = () => {
        const nextId = indexPhoto !== 0 ? indexPhoto - 1 : photos.length - 1;
        router.push(pathname + "?focus=" + photos[nextId]?.id);
    };

    const onConfirmDelete = () => {
        deleteMutation
            .mutateAsync()
            .then(() => {
                message.success("Data berhasil dihapus");
                onDelete();
                if (focusItem === photo?.id) {
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
                title: photo?.name?.CapitalizeEachFirstLetter(),
                text: "Coba cek karya ini! \n " + photo?.name,
                url: window.location.href.toString(),
            });
        }
    };

    return (
        <>
            <a ref={downloadRef} target="_blank" download id="download" hidden></a>
            <Modal title={photo?.name?.CapitalizeEachFirstLetter()} width="90vw" footer={null} centered open={modal} onCancel={onCloseModal}>
                <div className="flex items-center">
                    <button title="Sebelumnya" onClick={onPrevImage}>
                        <GrPrevious className="text-3xl" />
                    </button>
                    <div className="relative w-full min-h-[600px]">
                        <Image src={photo?.image!} alt={photo?.name!} fill className="object-contain rounded-sm" sizes="100vw" />
                    </div>
                    <button title="Selanjutnya" onClick={onNextImage}>
                        <GrNext className="text-3xl" />
                    </button>
                </div>
                <div className="flex items-center justify-between mb-10 mt-5">
                    <div className=""></div>
                    <div className="flex items-center justify-center gap-5">
                        <Button title="Disukai" variant="secondary" size="sm" className="cursor-default">
                            <AiFillHeart className="text-gray-500 text-lg mr-3" />
                            {photo?.loveCount?.length || 0}
                        </Button>
                        <Button title="Dilihat" variant="secondary" size="sm" className="cursor-default">
                            <AiOutlineEye className="text-gray-500 text-lg mr-3" />
                            {photo?.viewCount?.length || 0}
                        </Button>
                        <Button title="Didownload" variant="secondary" size="sm" onClick={download(photo)}>
                            <FaCloudDownloadAlt className="text-gray-500 text-lg mr-3" />
                            {photo?.downloadCount || 0}
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
                            title={"Hapus " + photo?.name}
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
                <div className="mb-5">
                    <h1 className="text-xl font-semibold font-poppins">{photo?.name?.CapitalizeEachFirstLetter()}</h1>
                    {photo?.location ? (
                        <div className="flex items-center text-gray-400 mt-5">
                            <FaMapLocationDot className="!text-gray-400 mr-2" />
                            {photo?.location?.CapitalizeEachFirstLetter()}
                        </div>
                    ) : null}
                    <div className="flex items-center text-gray-400 mb-5">
                        <BsCalendarCheck className="!text-gray-400 mr-2" />
                        {moment(photo?.uploadDate)?.format(FORMAT_DATE)}
                    </div>
                    {HTMLReactParser(photo?.description || "") ? <p className="">{HTMLReactParser(photo?.description || "")}</p> : null}
                    {photo?.tag ? (
                        <div className="flex items-center gap-4 mt-10">
                            {photo?.tag?.map((tag) => (
                                <Button size="sm" variant="outline" key={tag} className="cursor-default">
                                    {tag?.CapitalizeEachFirstLetter()}
                                </Button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="p-4 rounded border-2 border-solid border-gray-300">
                    <div className="mb-10">
                        <h1 className="text-xl font-semibold font-poppins">Album {photo?.albumName?.CapitalizeEachFirstLetter()}</h1>
                        {photo?.albumLocation ? (
                            <div className="flex items-center text-gray-400 mt-5">
                                <FaMapLocationDot className="!text-gray-400 mr-2" />
                                {photo?.albumLocation?.CapitalizeEachFirstLetter()}
                            </div>
                        ) : null}
                        {HTMLReactParser(photo?.albumDescription || "") ? <p className="">{HTMLReactParser(photo?.albumDescription || "")}</p> : null}
                        {photo?.albumTag ? (
                            <div className="flex items-center gap-4 mt-10">
                                {photo?.albumTag?.map((tag) => (
                                    <Button size="sm" variant="outline" key={tag} className="cursor-default">
                                        {tag?.CapitalizeEachFirstLetter()}
                                    </Button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-">
                        {photos?.map((pt) => (
                            <Link href={`/collection/photography?focus=${pt.id}`} key={pt.id}>
                                <div className={`relative h-[200px] w-full row-span-2 bg-black rounded-sm`}>
                                    <Image
                                        src={pt.image!}
                                        alt={pt.name!}
                                        fill
                                        className={`object-cover bg-gray-200 rounded-sm ${pt.id === focusItem ? "opacity-50" : ""}`}
                                        sizes="100vw"
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </Modal>
            <div className={deleteMutation.isLoading ? "opacity-20" : ""}>
                <button
                    className={`relative h-[300px] w-full grid grid-cols-2 grid-rows-2 gap-2 group ${deleteMutation.isLoading ? "opacity-20" : ""}`}
                    onClick={onOpenModal}
                >
                    {photo.komersil ? (
                        <div
                            title="Foto untuk komersial"
                            className="bg-gray-900 flex items-center justify-center w-8 h-8 rounded-full absolute top-3 left-3 z-10 shadow-md text-white"
                        >
                            <AiOutlineShopping className="text-white text-lg" />
                        </div>
                    ) : null}
                    <div className="group-hover:block hidden bg-black opacity-50 w-full h-full z-10 absolute top-0 left-0 pointer-events-none"></div>
                    {maxShowPhoto === 2 ? (
                        <>
                            {photos?.map((photo) => (
                                <div className="relative h-full w-full row-span-2" key={photo.id}>
                                    <Image src={photo.image!} alt={photo.name!} fill className="object-cover bg-gray-200 rounded-sm" sizes="100vw" />
                                </div>
                            ))}
                        </>
                    ) : null}
                    {maxShowPhoto === 3 ? (
                        <>
                            {photos?.map((photo, i) => (
                                <div className={`relative h-full w-full ${i === 1 ? "row-span-2" : ""}`} key={photo.id}>
                                    <Image src={photo.image!} alt={photo.name!} fill className="object-cover bg-gray-200 rounded-sm" sizes="100vw" />
                                </div>
                            ))}
                        </>
                    ) : null}
                    {maxShowPhoto === 4 ? (
                        <>
                            {[...photos].slice(0, 4).map((photo) => (
                                <div className={`relative h-full w-full`} key={photo.id}>
                                    <Image src={photo.image!} alt={photo.name!} fill className="object-cover bg-gray-200 rounded-sm" sizes="100vw" />
                                </div>
                            ))}
                        </>
                    ) : null}
                </button>
                <p title={photo.albumName} className="m-0 font-light font-poppins line-clamp-1">
                    {photo?.albumName?.CapitalizeEachFirstLetter()}
                </p>
            </div>
        </>
    );
};

export default memo(PhotoAlbum);
