"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { functionInstance } from "@/config/firebase-instance";
import { UserContext } from "@/context/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { message } from "antd";
import { httpsCallable } from "firebase/functions";
import { AlertCircle } from "lucide-react";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import * as z from "zod";

const formSchema = z.object({
    email: z.string().email(),
});

const updateAccount = httpsCallable(functionInstance, "updateAccount");

export default function Page() {
    const { state, fetcherUser } = useContext(UserContext);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: state?.user?.email!,
        },
    });

    useEffect(() => {
        form.setValue("email", state?.user?.email || "");
    }, [state?.user]);

    const changeMutate = useMutation(async (data: z.infer<typeof formSchema>) => {
        return (await updateAccount({ update: data, uid: state?.user?.uid, id: state?.user?.id })).data;
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!state?.user?.uid || !state?.user?.id) return;
        if (values.email === state?.user?.email) return;
        changeMutate.mutateAsync(values).then(() => {
            message.success("Akun berhasil diubah");
            fetcherUser?.mutate({ uid: state?.user?.uid });
        });
    }

    return (
        <div className="w-[400px] space-y-10">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 flex flex-col">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Email" {...field} />
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
