/* eslint-disable @next/next/no-img-element */
import { DataMessage } from "@/app/lib/chat/models";
import { ChatContext } from "@/context/chat";
import { ConfigContext } from "@/context/config";
import { UserContext } from "@/context/user";
import useFileUpload from "@/hooks/useFileUpload";
import chatService from "@/service/chat";
import fileService from "@/service/file";
import Image from "next/image";
import { useContext, useEffect } from "react";
import ChatInput from "./chat-input";
import HeaderChat from "./header";
import Messages from "./messages";

function Chat() {
    const { state: userState } = useContext(UserContext);
    const { state } = useContext(ConfigContext);
    const { setState: setChatState } = useContext(ChatContext);

    const { uploadFile, tasksProgress } = useFileUpload(
        (params) => {
            return fileService.SaveChatFile({
                file: params.file,
            });
        },
        {
            cid: state?.chatActive?.cid as any,
        }
    );

    useEffect(() => {
        if (setChatState) {
            setChatState((prev) => ({
                ...prev,
                tasksProgress,
            }));
        }
    }, [tasksProgress]);

    const onSubmitMessage = async (data: DataMessage) => {
        const messageId = await chatService.SendMessage({
            anytitle: (state?.chatActive?.anytitle as any) || "",
            link: state?.chatActive?.link as any,
            anyid: state?.chatActive?.anyid as any,
            uid2: state?.chatActive?.uid as any,
            uid: userState?.user?.uid as any,
            data,
        });
        if (!data.file) return;
        uploadFile({
            file: data.file,
            messageId,
        });
    };

    return (
        <div className="flex flex-col h-full">
            {state?.chatActive ? (
                <>
                    <HeaderChat />
                    <Messages key={state?.chatActive?.id} />
                    <ChatInput onSubmitMessage={onSubmitMessage} />
                </>
            ) : (
                <div className="w-full h-full flex items-center justify-center flex-col pointer-events-none">
                    <Image src="/images/bingkarya.svg" alt="bingkay karya" width={400} height={250} />
                    <p className="text-gray-300 font-medium text-2xl">Mulai hubungkan dengan kolegamu!</p>
                </div>
            )}
        </div>
    );
}

export default Chat;
