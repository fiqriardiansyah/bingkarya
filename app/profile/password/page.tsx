"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authInstance, functionInstance } from "@/config/firebase-instance";
import { UserContext } from "@/context/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { message } from "antd";
import { signInWithEmailAndPassword } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { AlertCircle } from "lucide-react";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import * as z from "zod";

const formSchema = z.object({
    password: z.string().min(6),
    newpassword: z.string().min(6),
});

const updateAccount = httpsCallable(functionInstance, "updateAccount");

export default function Page() {
    const { state, fetcherUser } = useContext(UserContext);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const changeMutate = useMutation(async (data: any) => {
        return (await updateAccount({ update: data, uid: state?.user?.uid, id: state?.user?.id })).data;
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!state?.user?.uid || !state?.user?.id) return;

        signInWithEmailAndPassword(authInstance, state?.user?.email!, values.password)
            .then((data) => {
                changeMutate.mutateAsync({ password: values.newpassword }).then(() => {
                    message.success("Password berhasil diubah");
                    fetcherUser?.mutate({ uid: state?.user?.uid });
                });
            })
            .catch((e: any) => {
                message.error(e?.message);
            });
    }

    return (
        <div className="w-[400px] space-y-10">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 flex flex-col">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password Lama</FormLabel>
                                <FormControl>
                                    <Input placeholder="Password Lama" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="newpassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password Baru</FormLabel>
                                <FormControl>
                                    <Input placeholder="Password Baru" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={changeMutate.isLoading} className="self-end">
                        Simpan Perubahan
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
