import { ConfigContext } from "@/context/config";
import { ChatInfo } from "@/models";
import { useRouter } from "next-nprogress-bar";
import React, { useContext } from "react";
import { FaTelegramPlane } from "react-icons/fa";

type Props = {
    disabled?: boolean;
    chatInfo: ChatInfo;
};

function ButtonChat({ disabled, chatInfo }: Props) {
    const { setChatActive } = useContext(ConfigContext);
    const router = useRouter();

    const onClickChatHandler = () => {
        if (setChatActive) {
            setChatActive(chatInfo);
            router.push("/chat");
        }
    };

    return (
        <button
            onClick={onClickChatHandler}
            disabled={disabled}
            className="cursor-pointer rounded-full w-10 h-10 bg-white border-solid border border-primary flex items-center justify-center"
            type="button"
        >
            <FaTelegramPlane className="text-primary text-2xl" />
        </button>
    );
}

export default ButtonChat;
