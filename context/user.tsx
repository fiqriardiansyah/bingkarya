import { Dispatch, SetStateAction, createContext, useEffect, useMemo, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { authInstance, functionInstance } from "@/config/firebase-instance";
import { useMutation, UseMutationResult } from "react-query";
import { UserData } from "@/models";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";

type Props = {
    children: any;
};

type State = {
    user: UserData;
};

type ValueContextType = {
    state?: State;
    setState?: Dispatch<SetStateAction<State>>;
    fetcherUser?: UseMutationResult<State, unknown>;
};

const UserContext = createContext<ValueContextType>({});

const getUser = httpsCallable(functionInstance, "getUser");

function UserProvider({ children }: Props) {
    const pathname = usePathname();
    const [state, setState] = useState<State | any>({});

    const getUserQuery = useMutation(
        ["get-user"],
        async ({ uid }: { uid: any }) => {
            return (await getUser({ uid })).data as UserData;
        },
        {
            onSuccess(data) {
                setState((prev: State) => ({ ...prev, user: { ...prev?.user, ...data } }));
            },
        }
    );

    useEffect(() => {
        onAuthStateChanged(authInstance, async (usr) => {
            if (usr) {
                getUserQuery.mutate({ uid: usr.uid });
                setState((prev: State) => ({ ...prev, user: { ...prev?.user, ...usr } }));
                return;
            }
            const cookie = Cookies.get("session");
            if (cookie) {
                signOut(authInstance).then(() => {
                    Cookies.remove("session");
                    window.location.href = "/";
                });
            }
        });
    }, [pathname]);

    const value = useMemo(
        () => ({
            state,
            setState,
            fetcherUser: getUserQuery,
        }),
        [state]
    );
    return <UserContext.Provider value={value as any}>{children}</UserContext.Provider>;
}

export { UserContext, UserProvider };
