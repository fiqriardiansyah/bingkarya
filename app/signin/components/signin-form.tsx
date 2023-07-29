"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authInstance, functionInstance } from "@/config/firebase-instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Divider, Spin } from "antd";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import Cookies from "js-cookie";
import { AlertCircle } from "lucide-react";
import { v4 as uuid } from "uuid";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { BsGoogle } from "react-icons/bs";
import { useMutation } from "react-query";
import * as z from "zod";
import { LoadingOutlined } from "@ant-design/icons";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
});

const getCookies = httpsCallable(functionInstance, "getCookies");
const createAccount = httpsCallable(functionInstance, "createAccount");

export default function SigninForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const signinMutate = useMutation(async (data: z.infer<typeof formSchema>) => {
        const user = (await signInWithEmailAndPassword(authInstance, data.email, data.password))?.user;
        const idToken = await user.getIdToken();
        const res = await getCookies({ idToken });
        return res.data as Promise<{ cookies: any }>;
    });

    const sigininGoogleMutate = useMutation(async () => {
        const provider = new GoogleAuthProvider();
        const user = (await signInWithPopup(authInstance, provider)).user;
        const idToken = await user.getIdToken();
        const res = await createAccount({ uid: user.uid, username: uuid(), idToken, profileImg: user?.photoURL });
        return res.data as Promise<{ cookies: any }>;
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        signinMutate.mutateAsync(values).then((res) => {
            Cookies.set(res.cookies.name, res.cookies.value, { expires: res.cookies.expires, secure: res.cookies.secure });
            setTimeout(() => {
                window.location.href = "/";
            }, 500);
        });
    }

    const clickSignInGoogleHandler = () => {
        sigininGoogleMutate.mutateAsync().then((res) => {
            Cookies.set(res.cookies.name, res.cookies.value, { expires: res.cookies.expires, secure: res.cookies.secure });
            setTimeout(() => {
                window.location.href = "/";
            }, 500);
        });
    };

    return (
        <div className="w-[400px] space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="mt-10 flex items-center justify-between">
                        <Button type="submit" disabled={signinMutate.isLoading || sigininGoogleMutate.isLoading}>
                            {signinMutate.isLoading || sigininGoogleMutate.isLoading ? (
                                <Spin size="large" indicator={<LoadingOutlined className="text-white mr-3" style={{ fontSize: 20 }} spin />} />
                            ) : (
                                "Sign in"
                            )}
                        </Button>
                        <Link href="/signup">
                            <Button variant="link">Belum punya akun?</Button>
                        </Link>
                    </div>
                    <Divider plain className="!text-gray-400 !w-[300px]">
                        Or signin with google
                    </Divider>
                    <Button
                        disabled={signinMutate.isLoading || sigininGoogleMutate.isLoading}
                        onClick={clickSignInGoogleHandler}
                        className="w-full"
                        type="button"
                    >
                        {signinMutate.isLoading || sigininGoogleMutate.isLoading ? (
                            <Spin size="large" indicator={<LoadingOutlined className="text-white mr-3" style={{ fontSize: 20 }} spin />} />
                        ) : (
                            <BsGoogle />
                        )}
                        <p className="capitalize m-0 ml-3">continue with google</p>
                    </Button>
                </form>
            </Form>
            {signinMutate.isError || sigininGoogleMutate.isError ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{(signinMutate.error || (sigininGoogleMutate.error as any))?.message}</AlertDescription>
                </Alert>
            ) : null}
        </div>
    );
}
