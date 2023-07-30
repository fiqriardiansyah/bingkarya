import StateRender from "@/components/ui/state";
import { functionInstance } from "@/config/firebase-instance";
import { UserContext } from "@/context/user";
import { UserData } from "@/models";
import { Skeleton } from "antd";
import { httpsCallable } from "firebase/functions";
import Image from "next/image";
import Link from "next/link";
import { memo, useContext } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { useQuery } from "react-query";

const getUser = httpsCallable(functionInstance, "getUser");

const OwnerContent = ({ uid }: { uid: any }) => {
    const { state } = useContext(UserContext);

    const getUserQuery = useQuery(
        ["get-user", uid],
        async () => {
            return (await getUser({ uid })).data as UserData;
        },
        {
            enabled: !!uid,
        }
    );

    const linkUser = () => {
        if (state?.user?.uid === uid) return "/profile";
        return "/user/" + uid;
    };

    return (
        <Link href={linkUser()}>
            <div className="p-3 flex items-center gap-4 bg-white container mx-auto px-28 hover:bg-slate-50">
                <StateRender data={getUserQuery.data} isLoading={getUserQuery.isLoading} isError={getUserQuery.isError}>
                    <StateRender.Data>
                        {getUserQuery.data?.profileImg ? (
                            <div className="w-[50px] h-[50px] relative rounded-full">
                                <Image
                                    quality={40}
                                    fill
                                    className="object-cover  "
                                    src={getUserQuery.data?.profileImg}
                                    alt={getUserQuery.data?.username}
                                />
                            </div>
                        ) : (
                            <FaRegUserCircle className="text-3xl text-gray-500" />
                        )}
                        <p className="m-0 text-gray-800 flex-1">
                            {(getUserQuery.data?.username || getUserQuery.data?.displayName)?.CapitalizeEachFirstLetter()}
                        </p>
                    </StateRender.Data>
                    <StateRender.Loading>
                        <Skeleton active avatar />
                    </StateRender.Loading>
                </StateRender>
            </div>
        </Link>
    );
};

export default memo(OwnerContent);
