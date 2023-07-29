"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectProps } from "antd";
import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import ReactQuill from "react-quill";
import * as z from "zod";

import "react-quill/dist/quill.snow.css";

const formSchema = z.object({
    name: z.string().min(5, {
        message: "Name must be at least 5 characters.",
    }),
    description: z.any(),
    location: z.any(),
    tag: z.any(),
});

type Props = { buttonSave?: ReactNode; onSubmit: (values: z.infer<typeof formSchema>) => void; defaultValues?: any };

export default function AlbumForm({ buttonSave, onSubmit, defaultValues }: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const onSubmitForm = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
    };

    const options: SelectProps["options"] = [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-2">
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
                {buttonSave}
            </form>
        </Form>
    );
}
