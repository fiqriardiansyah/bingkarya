import { TaskProgress } from "@/models";
import { Dispatch, SetStateAction, createContext, useMemo, useState } from "react";

type Props = {
    children: any;
};

type StateType = {
    tasksProgress: TaskProgress[];
};

type ValueContextType = {
    state?: StateType;
    setState?: Dispatch<SetStateAction<StateType>>;
    getThisTask?: (id: string) => TaskProgress;
};

const ChatContext = createContext<ValueContextType>({
    state: {
        tasksProgress: [],
    },
});

function ChatProvider({ children }: Props) {
    const [state, setState] = useState<StateType>({
        tasksProgress: [],
    });

    const getThisTask = (id: string) => {
        return state.tasksProgress.find((task) => task.mid === id);
    };

    const value = useMemo(
        () => ({
            state,
            setState,
            getThisTask,
        }),
        [state]
    );
    return <ChatContext.Provider value={value as any}>{children}</ChatContext.Provider>;
}

export { ChatContext, ChatProvider };
