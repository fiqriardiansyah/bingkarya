"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import StateRender from "@/components/ui/state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { functionInstance } from "@/config/firebase-instance";
import { UserData } from "@/models";
import { Skeleton } from "antd";
import { httpsCallable } from "firebase/functions";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
import { BiPlus } from "react-icons/bi";
import { FaRegUserCircle } from "react-icons/fa";
import { useQuery } from "react-query";
import Collection from "./components/collection";
import About from "./components/about";

const getOtherProfile = httpsCallable(functionInstance, "getOtherProfile");

export default function Page({ params }: { params: any }) {
    const getProfileQuery = useQuery(
        ["get-profile", params?.slug],
        async () => {
            return (await getOtherProfile({ uid: params?.slug })).data as { user: UserData };
        },
        {
            enabled: !!params?.slug,
        }
    );

    return (
        <div className="min-h-screen mt-16 ">
            <StateRender data={getProfileQuery.data} isLoading={getProfileQuery.isLoading} isError={getProfileQuery.isError}>
                <StateRender.Data>
                    <div className="jumbotron flex flex-col py-10 container mx-auto px-28 bg-gray-200">
                        <div className="flex items-center">
                            {getProfileQuery.data?.user?.profileImg ? (
                                <div className="w-[100px] h-[100px] relative rounded-full overflow-hidden">
                                    <Image
                                        src={getProfileQuery.data?.user?.profileImg}
                                        alt={getProfileQuery.data?.user?.username}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <FaRegUserCircle className="text-8xl text-gray-500" />
                            )}
                            <div className="flex items-center ml-10 gap-10">
                                <p className="m-0 text-xl text-gray-500">
                                    <span className="text-gray-900 text-3xl font-semibold">{getProfileQuery.data?.user?.like || 0}</span> Kali karya
                                    disukai
                                </p>
                                <p className="m-0 text-xl text-gray-500">
                                    <span className="text-gray-900 text-3xl font-semibold">{getProfileQuery.data?.user?.download || 0}</span> Kali
                                    karya diunduh
                                </p>
                                <p className="m-0 text-xl text-gray-500">
                                    <span className="text-gray-900 text-3xl font-semibold">{getProfileQuery.data?.user?.view || 0}</span> Kali karya
                                    dilihat
                                </p>
                            </div>
                        </div>
                        <h1 className="m-0 text-xl font-semibold mt-5">{getProfileQuery.data?.user?.username?.CapitalizeEachFirstLetter()}</h1>
                        <h1 className="m-0 text-4xl font-semibold mt-1">{getProfileQuery.data?.user?.profession?.CapitalizeEachFirstLetter()}</h1>
                        <div className="relative mt-10 flex items-center gap-5 w-fit" title="Dalam pengembangan">
                            <p className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 whitespace-nowrap">
                                Dalam pengembangan
                            </p>
                            <Button variant="default" className="pointer-events-none blur">
                                <BiPlus className="mr-2 text-lg" />
                                Ikuti
                            </Button>
                            <p className="m-0 blur">0 pengikut</p>
                            <p className="m-0 blur">0 diikuti</p>
                        </div>
                    </div>
                    <div className="container mx-auto px-28 my-10">
                        <Tabs defaultValue="art" className="">
                            <TabsList>
                                <TabsTrigger value="art" className="w-[150px]">
                                    karya
                                </TabsTrigger>
                                <TabsTrigger value="about" className="w-[150px]">
                                    Tentang
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="art" className="w-full">
                                <Collection />
                            </TabsContent>
                            <TabsContent value="about">
                                <About user={getProfileQuery.data?.user} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </StateRender.Data>
                <StateRender.Loading>
                    <div className="container mx-auto px-28">
                        <Skeleton active paragraph={{ rows: 5 }} />
                    </div>
                </StateRender.Loading>
                <StateRender.Error>
                    <div className="container mx-auto px-28">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{(getProfileQuery.error as any)?.message}</AlertDescription>
                        </Alert>
                    </div>
                </StateRender.Error>
            </StateRender>
        </div>
    );
}
