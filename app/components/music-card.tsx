import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { LuMusic4 } from "react-icons/lu";
import { MdAlbum } from "react-icons/md";
import { MusicProperty } from "../collection/music/page";
import UserHeader from "./user-header";

const MusicCard = ({ music }: { music: MusicProperty }) => {
    const Icon = music.type === "album" ? MdAlbum : LuMusic4;
    return (
        <Link href={"/m/" + music.id}>
            <div className="relative h-[300px] w-full group bg-black" title={music.name}>
                <UserHeader uid={music.uid} />
                <div className="group-hover:block hidden bg-black opacity-50 w-full h-full z-10 absolute top-0 left-0 pointer-events-none"></div>
                <Icon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10 text-9xl text-white opacity-80 drop-shadow-2xl" />
                <Image src={music.thumbnail!} alt={music.name!} fill className="object-cover bg-gray-200 opacity-60" sizes="100vw" />
                {music.type === "album" ? (
                    <div className="flex items-center absolute bottom-4 left-4 right-4 z-10 gap-4 rounded-sm">
                        <div className="relative w-[50px] h-[50px] rounded-md overflow-hidden">
                            <Image src={music.albumThumbnail!} alt={music.albumName!} className="object-cover w-[50px] h-[50px]" fill />
                        </div>
                        <p className="m-0 font-poppins text-sm line-clamp-2 text-left text-white drop-shadow-lg flex-1">
                            Album - {music.albumName?.CapitalizeEachFirstLetter()}
                        </p>
                    </div>
                ) : null}
            </div>
            <p title={music.name} className="m-0 font-light font-poppins line-clamp-1 mt-1">
                {music?.name?.CapitalizeEachFirstLetter()}
            </p>
        </Link>
    );
};

export default memo(MusicCard);
