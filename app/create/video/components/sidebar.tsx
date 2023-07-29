"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectProps, Spin, UploadFile, UploadProps } from "antd";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import ReactQuill from "react-quill";
import * as z from "zod";

import "react-quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import Dragger from "antd/es/upload/Dragger";
import Image from "next/image";
import { InboxOutlined, LoadingOutlined } from "@ant-design/icons";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
    name: z.string().min(5, {
        message: "Title must be at least 5 characters.",
    }),
    description: z.any(),
    location: z.any(),
    tag: z.any(),
});

export interface VideoInfo {
    description?: string;
    tag?: string[];
    location?: string;
    thumbnail?: File;
    name?: string;
    komersil: boolean;
}
export interface VideoInfoWithFile extends VideoInfo {}

type Props = { onUpload?: (value: VideoInfoWithFile) => void; loading?: boolean; name?: string };

export default function Sidebar({ onUpload, loading, name }: Props) {
    const [thumbnail, setThumbnail] = useState<UploadFile | null>(null);
    const [komersil, setKomersil] = useState<boolean>(false);
    const thumbnailLabelRef = useRef<HTMLLabelElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name,
        },
    });

    useEffect(() => {
        form.setValue("name", name || "");
    }, [name]);

    const onSubmitForm = (values: z.infer<typeof formSchema>) => {
        if (!thumbnail) {
            if (thumbnailLabelRef.current) {
                thumbnailLabelRef.current.classList.add("text-red-400");
            }
            return;
        }
        if (onUpload) onUpload({ ...values, thumbnail: thumbnail?.originFileObj as File, komersil });
    };

    const options: SelectProps["options"] = [];

    const props: UploadProps = {
        name: "image",
        multiple: false,
        onChange: (info) => {
            const file = info.file;
            setThumbnail(file);
            if (thumbnailLabelRef.current) {
                thumbnailLabelRef.current.classList.remove("text-red-400");
            }
        },
        showUploadList: false,
        accept: "image/png, image/jpeg, image/jpg, image/webp",
    };

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>Upload Karya Video</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2 my-3 mt-7">
                    <Switch checked={komersil} onCheckedChange={(c) => setKomersil(c)} id="komersil-switch" />
                    <Label htmlFor="komersil-switch">Tersedia untuk komersial</Label>
                </div>
                {komersil ? (
                    <p className="m-0 text-sm">
                        Kamu bisa membuat karyamu ditawar oleh orang lain. <br />
                        <span className="text-red-400">Hanya unggah karya contoh untuk komersial!</span>
                    </p>
                ) : null}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-2">
                        <div className="">
                            <label ref={thumbnailLabelRef} className="mb-4 mt-5 font-semibold" htmlFor="thumbnail">
                                Thumbnail
                            </label>
                            <Dragger {...props} id="thumbnail">
                                {thumbnail ? (
                                    <div className="relative w-full h-[200px]">
                                        <Image
                                            src={URL.createObjectURL((thumbnail?.originFileObj || thumbnail) as File)}
                                            alt="thumbnail"
                                            fill
                                            className="bg-gray-200 object-contain"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-800 text-5xl">
                                            <InboxOutlined className="" />
                                        </p>
                                        <p className="m-0 font-poppins text-sm mt-4 font-semibold">Klik atau dorong file</p>
                                        <p className="m-0 font-poppins font-light text-sm">Masukkan Thumbnail untuk album kamu</p>
                                    </>
                                )}
                            </Dragger>
                        </div>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Judul</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Judul" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi</FormLabel>
                                    <FormControl>
                                        <ReactQuill theme="snow" placeholder="Deskripsi" {...field} />
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
                                    <FormLabel>Lokasi</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Lokasi" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tag</FormLabel>
                                    <FormControl>
                                        <Select size="large" mode="tags" style={{ width: "100%" }} placeholder="Tag" options={options} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <Spin size="large" indicator={<LoadingOutlined className="text-white mr-3" style={{ fontSize: 20 }} spin />} />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            Upload
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
