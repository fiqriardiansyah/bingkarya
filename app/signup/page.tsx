import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SignupForm from "./components/signup-form";

export default function SignUp() {
    const sessionCookie = cookies().get("session");

    if (sessionCookie) {
        redirect("/");
    }

    return (
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center min-h-screen ">
            <div className="flex-1 flex flex-col items-center justify-center">
                <Image src="/images/bingkarya.svg" alt="bingkarya" width={200} height={100} />
                <h1 className="font-poppins mt-4">Temukan karya terbaik anak-anak indonesia</h1>
            </div>
            <div className="flex-1 flex flex-col items-center">
                <SignupForm />
            </div>
        </div>
    );
}
