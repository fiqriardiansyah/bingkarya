import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, UploadFile } from "antd";
import Image from "next/image";
import { BiMessageAltEdit } from "react-icons/bi";
import { TiDeleteOutline } from "react-icons/ti";
import AlbumForm from "./album-form";
import { memo, useState } from "react";
import { PiWarningCircleBold } from "react-icons/pi";

export interface PhotoInfo {
    description?: string;
    tag?: string[];
    location?: string;
}
export interface PhotoType extends UploadFile, PhotoInfo {
    completeInfo?: boolean;
}

type Props = {
    photo: PhotoType;
    onDelete: (photo: PhotoType) => void;
    onEdit: (photo: PhotoType) => void;
};

const Photo = ({ photo, onDelete, onEdit }: Props) => {
    const [modal, setModal] = useState(false);

    const defaultValues = {
        name: photo?.name,
        description: photo.description,
        tag: photo?.tag || [],
        location: photo?.location,
    };

    return (
        <div className="relative h-[200px]">
            {!photo?.completeInfo ? (
                <Tooltip title="Mohon lengkapi informasi" color="red">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-white absolute bottom-1 right-[5.5rem] z-10">
                        <PiWarningCircleBold className="text-red-400 text-2xl" />
                    </div>
                </Tooltip>
            ) : null}

            <div className="px-2 py-1 shadow-md z-10 flex items-center justify-center absolute bottom-1 right-1 bg-white rounded-full gap-x-3">
                <Dialog open={modal} onOpenChange={setModal}>
                    <DialogTrigger asChild>
                        <button onClick={() => setModal(true)} title="Edit informasi" className="cursor-pointer hover:opacity-70">
                            <BiMessageAltEdit className="text-gray-700 text-2xl" />
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-scroll scroll-custom">
                        <DialogHeader>
                            <div className="flex gap-3">
                                <div className="w-[50px] h-[50px] relative">
                                    <Image
                                        className="object-cover rounded-lg bg-gray-300"
                                        src={URL.createObjectURL(photo.originFileObj as any)}
                                        alt={photo.name}
                                        quality={30}
                                        fill
                                    />
                                </div>
                                <div className="flex-1">
                                    <DialogTitle>Informasi lengkap</DialogTitle>
                                    <DialogDescription>Mudahkan orang lain untuk mengetahui informasi gambar kamu</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <AlbumForm
                            defaultValues={defaultValues}
                            onSubmit={(values) => {
                                setModal(false);
                                onEdit({ ...photo, ...values, completeInfo: !!values.name });
                            }}
                            buttonSave={
                                <Button type="submit" className="mt-10">
                                    Simpan Informasi
                                </Button>
                            }
                        />
                    </DialogContent>
                </Dialog>
                <button onClick={() => onDelete(photo)} title="Hapus" className="cursor-pointer hover:opacity-70">
                    <TiDeleteOutline className="text-red-500 text-2xl" />
                </button>
            </div>
            <Image className="object-cover rounded-lg bg-gray-300" src={URL.createObjectURL(photo.originFileObj as any)} alt={photo.name} fill />
        </div>
    );
};

export default memo(Photo);
