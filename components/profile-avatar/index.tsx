import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authInstance } from "@/config/firebase-instance";
import { UserContext } from "@/context/user";
import { LoadingOutlined } from "@ant-design/icons";
import { Dropdown, MenuProps, Spin } from "antd";
import { signOut } from "firebase/auth";
import Cookies from "js-cookie";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";
import { BsCollection, BsFillBookmarkHeartFill } from "react-icons/bs";
import { FaRegUserCircle } from "react-icons/fa";

export default function ProfileAvatar() {
    const { state, fetcherUser } = useContext(UserContext);

    const logout = () => {
        signOut(authInstance).then(() => {
            Cookies.remove("session");
            window.location.href = "/";
        });
    };

    const items: MenuProps["items"] = [
        {
            key: "0",
            label: (
                <div className="flex items-center w-[200px]">
                    <p className="">{(state?.user?.username || state?.user?.displayName)?.CapitalizeEachFirstLetter()}</p>
                </div>
            ),
            type: "group",
        },
        {
            key: "1",
            label: (
                <Link href="/profile">
                    <div className="flex items-center w-[200px]">
                        <div className="flex items-center gap-1">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </div>
                    </div>
                </Link>
            ),
        },
        {
            key: "2",
            label: (
                <Link href="/collection">
                    <div className="flex items-center w-[200px]">
                        <div className="flex items-center gap-1">
                            <BsCollection className="mr-2 h-4 w-4" />
                            <span>Koleksi ku</span>
                        </div>
                    </div>
                </Link>
            ),
        },
        {
            key: "3",
            label: (
                <Link href="/favorite">
                    <div className="flex items-center w-[200px]">
                        <div className="flex items-center gap-1">
                            <BsFillBookmarkHeartFill className="mr-2 h-4 w-4" />
                            <span>Disukai</span>
                        </div>
                    </div>
                </Link>
            ),
        },
        {
            key: "4",
            label: (
                <div className="flex items-center w-[200px]">
                    <div className="flex items-center gap-1">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </div>
                </div>
            ),
            onClick: logout,
            danger: true,
        },
    ];

    return (
        <Dropdown menu={{ items }} trigger={["click", "hover"]}>
            {state?.user && !fetcherUser?.isLoading ? (
                state?.user?.profileImg ? (
                    <div className="w-[50px] h-[50px] relative rounded-full overflow-hidden">
                        <Image quality={40} fill className="object-cover  " src={state?.user?.profileImg} alt={state?.user?.username} />
                    </div>
                ) : (
                    <FaRegUserCircle className="text-3xl text-gray-500" />
                )
            ) : (
                <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            )}
        </Dropdown>
    );
}
