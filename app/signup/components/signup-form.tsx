"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authInstance, functionInstance } from "@/config/firebase-instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Divider, Spin } from "antd";
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import Cookies from "js-cookie";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { v4 as uuid } from "uuid";
import { useForm } from "react-hook-form";
import { BsGoogle } from "react-icons/bs";
import { useMutation } from "react-query";
import * as z from "zod";
import { LoadingOutlined } from "@ant-design/icons";

const formSchema = z.object({
    username: z.string().min(5, {
        message: "Username must be at least 5 characters.",
    }),
    email: z.string().email(),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
});

const createAccount = httpsCallable(functionInstance, "createAccount");
const checkUsername = httpsCallable(functionInstance, "checkUsername");

export default function SignupForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    const signupMutate = useMutation(async (data: z.infer<typeof formSchema>) => {
        const checkUsr = await checkUsername({ username: data.username });

        const user = (await createUserWithEmailAndPassword(authInstance, data.email, data.password))?.user;
        const idToken = await user.getIdToken();
        const res = await createAccount({ uid: user.uid, username: data.username, idToken, profileImg: user?.photoURL });
        return res.data as Promise<{ cookies: any }>;
    });

    const signupGoogleMutate = useMutation(async () => {
        const provider = new GoogleAuthProvider();
        const user = (await signInWithPopup(authInstance, provider))?.user;
        const idToken = await user.getIdToken();
        const res = await createAccount({ uid: user.uid, username: uuid(), idToken, profileImg: user?.photoURL });
        return res.data as Promise<{ cookies: any }>;
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        signupMutate.mutateAsync(values).then((res) => {
            Cookies.set(res.cookies.name, res.cookies.value, { expires: res.cookies.expires, secure: res.cookies.secure });
            setTimeout(() => {
                window.location.href = "/";
            }, 500);
        });
    }

    const clickSignInGoogleHandler = () => {
        signupGoogleMutate.mutateAsync().then((res) => {
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
                        <Button type="submit" disabled={signupMutate.isLoading || signupGoogleMutate.isLoading}>
                            {signupMutate.isLoading || signupGoogleMutate.isLoading ? (
                                <Spin size="large" indicator={<LoadingOutlined className="text-white mr-3" style={{ fontSize: 20 }} spin />} />
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                        <Link href="/signin">
                            <Button variant="link">Sudah punya akun?</Button>
                        </Link>
                    </div>
                    <Divider plain className="!text-gray-400 !w-[300px]">
                        Or signup with google
                    </Divider>
                    <Button
                        disabled={signupMutate.isLoading || signupGoogleMutate.isLoading}
                        onClick={clickSignInGoogleHandler}
                        className="w-full"
                        type="button"
                    >
                        {signupMutate.isLoading || signupGoogleMutate.isLoading ? (
                            <Spin size="large" indicator={<LoadingOutlined className="text-white mr-3" style={{ fontSize: 20 }} spin />} />
                        ) : (
                            <BsGoogle />
                        )}
                        <p className="capitalize m-0 ml-3">continue with google</p>
                    </Button>
                </form>
            </Form>
            {signupMutate.isError || signupGoogleMutate.isError ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{(signupMutate.error || (signupGoogleMutate.error as any))?.message}</AlertDescription>
                </Alert>
            ) : null}
            {signupMutate.data || signupGoogleMutate.data ? (
                <Alert variant="default">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Sukses</AlertTitle>
                    <AlertDescription>Akun berhasil terdaftar</AlertDescription>
                </Alert>
            ) : null}
        </div>
    );
}
