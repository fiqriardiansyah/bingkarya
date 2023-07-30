import "@/lib/extension";
import "../styles/globals.css";
import Config from "./components/config";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const pathAllowUnSignin = ["/signin", "/signup", "/"];

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const cookie = cookies().get("session");
    const headersList = headers();
    const activePath = headersList.get("x-invoke-path");

    if (!pathAllowUnSignin.includes(activePath || "/") && !cookie) {
        redirect("/signin");
    }

    return (
        <>
            <html lang="id">
                <head>
                    <title>Bingkay karya</title>
                    <meta name="dicoding:email" content="fiqriardian92@gmail.com" />
                    <meta name="description" content="Cari karya apapun disini!!" />
                    <link rel="icon" type="image" href="/icon.png"></link>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500&display=swap" rel="stylesheet" />
                </head>
                <body className="">
                    <Config>{children}</Config>
                </body>
            </html>
        </>
    );
}
