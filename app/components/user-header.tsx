import StateRender from "@/components/ui/state";
import { functionInstance } from "@/config/firebase-instance";
import { UserData } from "@/models";
import { Skeleton } from "antd";
import { httpsCallable } from "firebase/functions";
import Image from "next/image";
import { memo } from "react";
import { useQuery } from "react-query";

const getUser = httpsCallable(functionInstance, "getUser");

const UserHeader = ({ uid }: { uid?: string }) => {
    const getUserQuery = useQuery(
        ["get-user", uid],
        async () => {
            return (await getUser({ uid })).data as UserData;
        },
        {
            enabled: !!uid,
        }
    );

    return (
        <div className="p-3 flex items-center gap-4 group absolute top-0 left-0 z-20">
            <StateRender data={getUserQuery.data} isLoading={getUserQuery.isLoading} isError={getUserQuery.isError}>
                <StateRender.Data>
                    {getUserQuery.data?.profileImg ? (
                        <div className="w-[50px] h-[50px] relative rounded-full opacity-0 group-hover:opacity-100 duration-150">
                            <Image
                                quality={40}
                                fill
                                className="object-cover  "
                                src={getUserQuery.data?.profileImg}
                                alt={getUserQuery.data?.username || getUserQuery.data?.displayName || ""}
                            />
                        </div>
                    ) : null}
                    <p className="m-0 opacity-0 group-hover:opacity-100 duration-150 text-white flex-1">
                        {(getUserQuery.data?.username || getUserQuery.data?.displayName)?.CapitalizeEachFirstLetter()}
                    </p>
                </StateRender.Data>
                <StateRender.Loading>
                    <Skeleton active avatar />
                </StateRender.Loading>
            </StateRender>
        </div>
    );
};

export default memo(UserHeader);
