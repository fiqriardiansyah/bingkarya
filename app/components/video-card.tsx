import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { MdSlowMotionVideo } from "react-icons/md";
import { VideosProperty } from "../collection/video/page";
import UserHeader from "./user-header";

const VideoCard = ({ video }: { video: VideosProperty }) => {
    return (
        <Link href={"/v/" + video.id}>
            <div className="relative h-[300px] w-full group bg-black">
                <UserHeader uid={video.uid} />
                <div className="group-hover:block hidden bg-black opacity-50 w-full h-full z-10 absolute top-0 left-0 pointer-events-none"></div>
                <MdSlowMotionVideo className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-10 text-9xl text-white opacity-80" />
                <Image src={video.mainThumbnail!} alt={video.name!} fill className="object-cover bg-gray-200 rounded-sm opacity-50" sizes="100vw" />
            </div>
            <p title={video.name} className="m-0 font-light font-poppins line-clamp-1 mt-1">
                {video?.name?.CapitalizeEachFirstLetter()}
            </p>
        </Link>
    );
};

export default memo(VideoCard);
