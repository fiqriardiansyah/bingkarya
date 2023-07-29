import Card from "@/app/components/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StateRender from "@/components/ui/state";
import { functionInstance } from "@/config/firebase-instance";
import { Skeleton } from "antd";
import { httpsCallable } from "firebase/functions";
import { AlertCircle } from "lucide-react";
import { memo } from "react";
import Lottie from "react-lottie";
import { useQuery } from "react-query";
import ghostAnim from "@/animation/ghost.json";
import { useParams } from "next/navigation";

const getUserCollection = httpsCallable(functionInstance, "getUserCollection");

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: ghostAnim,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

const Collection = () => {
    const params = useParams();

    const getUserCollectionQuery = useQuery(
        ["get-user-collection", params?.slug],
        async () => {
            return (await getUserCollection({ uid: params?.slug })).data as Promise<{ list: any[] }>;
        },
        {
            enabled: !!params?.slug,
        }
    );

    return (
        <>
            <h1 className="my-5 text-xl font-poppins">Koleksi karya</h1>
            <StateRender data={getUserCollectionQuery.data} isLoading={getUserCollectionQuery.isLoading} isError={getUserCollectionQuery.isError}>
                <StateRender.Data>
                    <div className="grid grid-cols-3 gap-8">
                        {getUserCollectionQuery.data?.list?.map((ctn) => (
                            <Card content={ctn} key={ctn.id} />
                        ))}
                    </div>
                    {!getUserCollectionQuery.data?.list?.length ? (
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
                        <AlertDescription>{(getUserCollectionQuery.error as any)?.message}</AlertDescription>
                    </Alert>
                </StateRender.Error>
            </StateRender>
        </>
    );
};

export default memo(Collection);
