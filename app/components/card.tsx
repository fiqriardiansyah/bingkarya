import { memo } from "react";
import MusicCard from "./music-card";
import PhotoCard from "./photo-card";
import VideoCard from "./video-card";

const Card = ({ content }: { content: any }) => {
    if (content.art === "music") return <MusicCard music={content} />;
    if (content.art === "video") return <VideoCard video={content} />;
    return <PhotoCard photo={content} />;
};

export default memo(Card);
