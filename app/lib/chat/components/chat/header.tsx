import { useContext } from "react";

import { functionInstance } from "@/config/firebase-instance";
import { ConfigContext } from "@/context/config";
import { ShortProfile } from "@/models";
import Image from "next/image";
import SkeletonInput from "antd/lib/skeleton/Input";
import { httpsCallable } from "firebase/functions";
import { BiLink } from "react-icons/bi";
import { FaUserAlt } from "react-icons/fa";
import { useQuery } from "react-query";
import Link from "next/link";

const getShortProfile = httpsCallable(functionInstance, "getShortProfile");

function HeaderChat() {
    const { state } = useContext(ConfigContext);

    const userQuery = useQuery(
        [`get-user-${state?.chatActive?.uid}`],
        async () => {
            return (await getShortProfile({ uid: state?.chatActive?.uid })).data as ShortProfile;
        },
        {
            enabled: !!state?.chatActive,
        }
    );

    return (
        <>
            <header className="w-full flex items-center p-2">
                <Link href={"/user/" + state?.chatActive?.uid}>
                    {!userQuery.data?.profileImg ? (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
                            <FaUserAlt className="text-2xl text-gray-400" />
                        </div>
                    ) : (
                        <div className="relative w-[40px] h-[40px] rounded-full overflow-hidden">
                            <Image src={userQuery.data?.profileImg!} alt={userQuery.data?.username} fill className="object-cover" />
                        </div>
                    )}
                </Link>
                <div className="flex flex-col ml-3">
                    {userQuery.isLoading ? (
                        <SkeletonInput active size="small" />
                    ) : (
                        <Link href={"/user/" + state?.chatActive?.uid}>
                            <p className="m-0 capitalize font-semibold text-gray-700 hover:opacity-80">{userQuery.data?.username}</p>
                        </Link>
                    )}
                    <Link href={state?.chatActive?.link || "/"}>
                        <p className="m-0 capitalize text-xs line-clamp-1 !text-blue-500 flex items-center">
                            <BiLink className="mr-1" /> {state?.chatActive?.anytitle}
                        </p>
                    </Link>
                </div>
            </header>
            <div className="w-full bg-slate-300" style={{ height: "1px" }} />
        </>
    );
}

export default HeaderChat;
