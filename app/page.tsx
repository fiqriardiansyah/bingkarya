"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StateRender from "@/components/ui/state";
import { functionInstance } from "@/config/firebase-instance";
import { Skeleton } from "antd";
import { httpsCallable } from "firebase/functions";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Lottie from "react-lottie";
import { useQuery } from "react-query";
import ghostAnim from "@/animation/ghost.json";
import Card from "./components/card";

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: ghostAnim,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
};

const homePageContent = httpsCallable(functionInstance, "homePageContent");

export default function Page({ searchParams }: { searchParams: any }) {
    const homeContentQuery = useQuery(
        ["home-page-content", searchParams?.q],
        async () => {
            return (await homePageContent({ q: searchParams?.q })).data as any;
        },
        {
            refetchInterval: false,
            refetchOnWindowFocus: false,
        }
    );

    return (
        <>
            <div className="min-h-screen mt-16">
                <div className="w-full h-[60vh] relative">
                    <Image src="/images/bingkarya.png" alt="bingkarya" fill sizes="100vw" className="object-cover" />
                </div>
                <div className="container mx-auto px-28 mb-20">
                    <h1 className="font-poppins text-2xl my-5">Temukan inspirasi mu!</h1>
                    <StateRender data={homeContentQuery.data} isLoading={homeContentQuery.isLoading} isError={homeContentQuery.isError}>
                        <StateRender.Data>
                            <div className="grid grid-cols-3 gap-7 mt-10">
                                {homeContentQuery.data?.list?.map((ctn: any) => (
                                    <Card content={ctn} key={ctn.id} />
                                ))}
                            </div>
                            {!homeContentQuery.data?.list?.length ? (
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
                            <div className="grid grid-cols-4 gap-3">
                                {[...new Array(5)].map((_, i) => (
                                    <Skeleton.Image active className="!h-[300px] !w-full" key={i} />
                                ))}
                            </div>
                        </StateRender.Loading>
                        <StateRender.Error>
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{(homeContentQuery.error as any)?.message}</AlertDescription>
                            </Alert>
                        </StateRender.Error>
                    </StateRender>
                </div>
            </div>
        </>
    );
}
