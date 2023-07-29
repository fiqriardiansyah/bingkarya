import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { PhotosProperty } from "../collection/photography/page";
import UserHeader from "./user-header";

const PhotoCard = ({ photo }: { photo: PhotosProperty & { list?: string[] } }) => {
    const maxShowPhoto = photo?.list ? (photo.list.length > 4 ? 4 : photo.list.length) : 1;

    return (
        <Link href={"/p/" + photo.id}>
            {photo?.list ? (
                <div className={`relative h-[300px] w-full grid grid-cols-2 grid-rows-2 gap-2 group`}>
                    <UserHeader uid={photo.uid} />
                    <div className="group-hover:block hidden bg-black opacity-50 w-full h-full z-10 absolute top-0 left-0 pointer-events-none"></div>
                    {maxShowPhoto === 1 ? (
                        <>
                            {[...photo.list, photo.image]?.map((photo, i) => (
                                <div className="relative h-full w-full row-span-2" key={i}>
                                    <Image src={photo!} alt="image album" fill className="object-cover bg-gray-200 rounded-sm" sizes="100vw" />
                                </div>
                            ))}
                        </>
                    ) : null}
                    {maxShowPhoto === 2 ? (
                        <>
                            {[...photo.list, photo.image]?.map((photo, i) => (
                                <div className={`relative h-full w-full ${i === 1 ? "row-span-2" : ""}`} key={i}>
                                    <Image src={photo!} alt="image album" fill className="object-cover bg-gray-200 rounded-sm" sizes="100vw" />
                                </div>
                            ))}
                        </>
                    ) : null}
                    {maxShowPhoto >= 3 ? (
                        <>
                            {[...photo.list, photo.image].slice(0, 4).map((photo, i) => (
                                <div className={`relative h-full w-full`} key={i}>
                                    <Image src={photo!} alt="image album" fill className="object-cover bg-gray-200 rounded-sm" sizes="100vw" />
                                </div>
                            ))}
                        </>
                    ) : null}
                </div>
            ) : (
                <div className="relative h-[300px] w-full group">
                    <UserHeader uid={photo.uid} />
                    <div className="group-hover:block hidden bg-black opacity-50 w-full h-full z-10 absolute top-0 left-0 pointer-events-none"></div>
                    <Image src={photo.image!} alt={photo.name!} fill className="object-cover bg-gray-200 rounded-sm" sizes="100vw" />
                </div>
            )}
            <p title={photo.name} className="m-0 font-light font-poppins mt-1 line-clamp-1">
                {photo?.name?.CapitalizeEachFirstLetter()}
            </p>
        </Link>
    );
};

export default memo(PhotoCard);
