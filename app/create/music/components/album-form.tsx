"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectProps, UploadFile, UploadProps } from "antd";
import { ReactNode, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ReactQuill from "react-quill";
import * as z from "zod";

import "react-quill/dist/quill.snow.css";
import Dragger from "antd/es/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";
import Image from "next/image";

const formSchema = z.object({
    thumbnail: z.any(),
    name: z.string().min(5, {
        message: "Name must be at least 5 characters.",
    }),
    lyrics: z.any(),
    tag: z.any(),
});

type Props = { buttonSave?: ReactNode; onSubmit: (values: z.infer<typeof formSchema>) => void; defaultValues?: any };

export default function AlbumForm({ buttonSave, onSubmit, defaultValues }: Props) {
    const [thumbnail, setThumbnail] = useState<UploadFile | null>(defaultValues?.thumbnail || null);
    const thumbnailLabelRef = useRef<HTMLLabelElement>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const onSubmitForm = (values: z.infer<typeof formSchema>) => {
        if (!thumbnail) {
            if (thumbnailLabelRef.current) {
                thumbnailLabelRef.current.classList.add("text-red-400");
            }
            return;
        }
        onSubmit({
            ...values,
            thumbnail: thumbnail?.originFileObj ?? thumbnail,
        });
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
                    name="lyrics"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Lirik</FormLabel>
                            <FormControl>
                                <ReactQuill theme="snow" placeholder="Lirik" {...field} />
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
                {buttonSave}
            </form>
        </Form>
    );
}
