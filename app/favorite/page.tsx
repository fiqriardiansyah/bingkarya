"use client";

import { functionInstance } from "@/config/firebase-instance";
import { httpsCallable } from "firebase/functions";
import { useQuery } from "react-query";
import ghostAnim from "@/animation/ghost.json";
import { useContext } from "react";
import { UserContext } from "@/context/user";
import StateRender from "@/components/ui/state";
import Card from "../components/card";
import Lottie from "react-lottie";
import { Skeleton } from "antd";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const getFavorites = httpsCallable(functionInstance, "getFavorites");

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: ghostAnim,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

export default function Page() {
    const { state } = useContext(UserContext);

    const getFavoritesQuery = useQuery(
        ["get-favorite", state?.user?.favoriteContent],
        async () => {
            return (await getFavorites({ favorites: state?.user?.favoriteContent || [] })).data as Promise<{ list: any[] }>;
        },
        {
            enabled: !!state?.user,
        }
    );

    return (
        <div className="mt-16 container mx-auto px-28">
            <h1 className="my-5 text-xl font-poppins mt-20">Karya yang anda sukai</h1>
            <StateRender data={getFavoritesQuery.data} isLoading={getFavoritesQuery.isLoading} isError={getFavoritesQuery.isError}>
                <StateRender.Data>
                    <div className="grid grid-cols-3 gap-8">
                        {getFavoritesQuery.data?.list?.map((ctn) => (
                            <Card content={ctn} key={ctn.id} />
                        ))}
                    </div>
                    {!getFavoritesQuery.data?.list?.length ? (
                        <div className="flex items-center justify-center flex-col">
                            <Lottie
                                options={defaultOptions}
                                height={300}
                                width={300}
                                isClickToPauseDisabled={false}
                                style={{ pointerEvents: "none" }}
                            />
                            <h1 className="text-2xl">Kosong nih...</h1>
                        </div>
                    ) : null}
                </StateRender.Data>
                <StateRender.Loading>
                    <div className="grid grid-cols-3 gap-3">
                        {[...new Array(5)].map((_, i) => (
                            <Skeleton.Image active className="!h-[300px] !w-full" key={i} />
                        ))}
                    </div>
                </StateRender.Loading>
                <StateRender.Error>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{(getFavoritesQuery.error as any)?.message}</AlertDescription>
                    </Alert>
                </StateRender.Error>
            </StateRender>
        </div>
    );
}
