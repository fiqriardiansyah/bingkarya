"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { functionInstance } from "@/config/firebase-instance";
import { UserContext } from "@/context/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spin, message } from "antd";
import { httpsCallable } from "firebase/functions";
import { AlertCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import * as z from "zod";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Image from "next/image";
import { FaRegUserCircle } from "react-icons/fa";
import { fileUploadByte } from "@/app/create/lib/file-upload";
import { cleanObj } from "@/lib/utils";
import { LoadingOutlined } from "@ant-design/icons";

const formSchema = z.object({
    username: z.string().min(5, {
        message: "Username must be at least 5 characters.",
    }),
    location: z.any(),
    bio: z.any(),
    personalWebUrl: z.any(),
    portfolioUrl: z.any(),
    profession: z.any(),
});

const editProfile = httpsCallable(functionInstance, "editProfile");

export default function Page() {
    const { state, fetcherUser } = useContext(UserContext);
    const [file, setFile] = useState<File | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        form.setValue("username", state?.user?.username || "");
        form.setValue("profession", state?.user?.profession || "");
        form.setValue("bio", state?.user?.bio || "");
        form.setValue("location", state?.user?.location || "");
        form.setValue("personalWebUrl", state?.user?.personalWebUrl || "");
        form.setValue("portfolioUrl", state?.user?.portfolioUrl || "");
    }, [state?.user]);

    const changeMutate = useMutation(async (data: z.infer<typeof formSchema>) => {
        return (await editProfile({ update: data, uid: state?.user?.uid, id: state?.user?.id })).data;
    });

    const uploadImageMutate = useMutation(async (data: any) => {
        return (await editProfile({ update: data, uid: state?.user?.uid, id: state?.user?.id })).data;
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const cleanValues = cleanObj(values);
        if (!state?.user?.uid || !state?.user?.id) return;
        changeMutate.mutateAsync(cleanValues).then(() => {
            message.success("Data kamu berhasil diubah");
            fetcherUser?.mutate({ uid: state?.user?.uid });
        });
    }

    const onChangeImage = (e: any) => {
        setFile(e.target.files[0]);
    };

    const uploadImage = async () => {
        if (!file) return;
        fileUploadByte({ file, name: state?.user?.username, path: "profile" })
            .then((url) => {
                uploadImageMutate.mutateAsync({ profileImg: url }).then(() => {
                    message.success("Profil berhasil diubah");
                    fetcherUser?.mutate({ uid: state?.user?.uid });
                });
            })
            .catch((e: any) => {
                message.error(e?.message);
            });
    };

    return (
        <div className="w-[50vw] space-y-10 pb-10">
            <div className="mb-10 flex items-center gap-3">
                {state?.user?.profileImg ? (
                    <div className="w-[100px] h-[100px] relative rounded-full overflow-hidden">
                        <Image src={state?.user?.profileImg} alt={state?.user?.username} fill className="object-cover" />
                    </div>
                ) : (
                    <FaRegUserCircle className="text-8xl text-gray-500" />
                )}
                <Input type="file" accept=".png, .jpeg, .jpg" onChange={onChangeImage} className="flex-1" />
                <Button disabled={!file || uploadImageMutate.isLoading} variant="secondary" onClick={uploadImage}>
                    {uploadImageMutate.isLoading ? (
                        <Spin size="large" indicator={<LoadingOutlined className="text-white mr-3" style={{ fontSize: 20 }} spin />} />
                    ) : (
                        "Upload"
                    )}
                </Button>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 flex flex-col">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="Username" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="profession"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Profesi</FormLabel>
                                <FormControl>
                                    <Input placeholder="Profesi" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="Location" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                    <ReactQuill theme="snow" placeholder="Bio" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <h2 className="text-gray-500 font-semibold text-lg mt-10">BUAT DIRIMU TERLIHAT</h2>
                    <FormField
                        control={form.control}
                        name="personalWebUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Link Web Pribadi</FormLabel>
                                <FormControl>
                                    <Input placeholder="Link Web Pribadi" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="portfolioUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Link Portfolio</FormLabel>
                                <FormControl>
                                    <Input placeholder="Link Portfolio" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={changeMutate.isLoading} className="self-end">
                        {changeMutate.isLoading ? (
                            <Spin size="large" indicator={<LoadingOutlined className="text-white mr-3" style={{ fontSize: 20 }} spin />} />
                        ) : (
                            "Simpan Perubahan"
                        )}
                    </Button>
                </form>
            </Form>
            {changeMutate.isError ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{(changeMutate.error as any)?.message}</AlertDescription>
                </Alert>
            ) : null}
        </div>
    );
}
