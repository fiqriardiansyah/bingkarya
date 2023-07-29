import { ChatInfo } from "@/models";
import { notification } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";
import { Dispatch, SetStateAction, createContext, useMemo, useState } from "react";

type Props = {
    children: any;
};

type State = {
    chatActive: ChatInfo | null;
};

type ValueContextType = {
    state?: State;
    setState?: Dispatch<SetStateAction<State>>;
    notifInstance?: NotificationInstance;
    setChatActive?: (data: ChatInfo) => {};
};

const ConfigContext = createContext<ValueContextType>({});

function ConfigProvider({ children }: Props) {
    const [state, setState] = useState<State | any>({});
    const [notifInstance, contextHolder] = notification.useNotification();

    const setChatActive = (chatInfo: ChatInfo) => {
        setState((prev: State) => ({
            ...prev,
            chatActive: chatInfo,
        }));
    };

    const value = useMemo(
        () => ({
            state,
            setState,
            notifInstance,
            setChatActive,
        }),
        [state]
    );
    return (
        <>
            {contextHolder}
            <ConfigContext.Provider value={value as any}>{children}</ConfigContext.Provider>
        </>
    );
}

export { ConfigProvider, ConfigContext };
