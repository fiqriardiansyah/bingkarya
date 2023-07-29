import { functionInstance } from "@/config/firebase-instance";
import { ConfigContext } from "@/context/config";
import { IMAGES_TYPE, IMAGE_FALLBACK, stripHtml } from "@/lib/utils";
import { ChatInfo, ShortProfile } from "@/models";
import SkeletonInput from "antd/lib/skeleton/Input";
import classNames from "classnames";
import { httpsCallable } from "firebase/functions";
import moment from "moment";
import Image from "next/image";
import { useContext, useMemo } from "react";
import { AiFillFile } from "react-icons/ai";
import { BsCardImage } from "react-icons/bs";
import { FaUserAlt } from "react-icons/fa";
import { useQuery } from "react-query";

type Props = {
    data: ChatInfo;
    onClick: (dt: ChatInfo) => void;
};

const getShortProfile = httpsCallable(functionInstance, "getShortProfile");

function ChatItem({ data, onClick }: Props) {
    const { state } = useContext(ConfigContext);

    const userQuery = useQuery([`get-user-${data.uid}`], async () => {
        return (await getShortProfile({ uid: data.uid })).data as ShortProfile;
    });

    console.log(state?.chatActive?.id, data.id);

    const className = classNames(
        "focus:outline-none focus:bg-gray-100 hover:bg-gray-100 pt-2 flex justify-start w-full px-2 cursor-pointer bg-transparent border-none",
        {
            "bg-blue-50": state?.chatActive?.id === data.id,
        }
    );

    const lastMessage = useMemo(() => {
        if (data.type === "text") {
            return <p className="m-0 line-clamp-1 text-xs text-left break-all">{stripHtml(data?.last_message || "")}</p>;
        }
        if (IMAGES_TYPE.includes(data?.type || "")) {
            return <BsCardImage className="text-gray-400" />;
        }
        return <AiFillFile className="text-gray-400" />;
    }, []);

    return (
        <button onClick={() => onClick(data)} type="button" className={className}>
            {!userQuery.data?.profileImg ? (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
                    <FaUserAlt className="text-2xl text-gray-400" />
                </div>
            ) : (
                <div className="relative w-[40px] h-[40px] rounded-full overflow-hidden">
                    <Image src={userQuery.data?.profileImg!} alt={userQuery.data?.username} fill className="object-cover" />
                </div>
            )}
            <div className="flex flex-col flex-1 ml-2">
                <div className="flex items-start justify-between">
                    {userQuery.isLoading ? (
                        <SkeletonInput active size="small" />
                    ) : (
                        <p className="m-0 line-clamp-1 capitalize text-sm font-semibold text-gray-700 text-left">{userQuery.data?.username}</p>
                    )}
                    <span className="m-0 text-xs text-gray-300">{moment(data.last_chat).format("DD MMM, LT")}</span>
                </div>
                <p className="text-blue-400 m-0 capitalize text-xs text-primary text-left line-clamp-1">{data.anytitle}</p>
                <span className="line-clamp-2">{lastMessage}</span>
                <div className="w-full bg-slate-200 mt-2" style={{ height: "1px" }} />
            </div>
        </button>
    );
}

export default ChatItem;
