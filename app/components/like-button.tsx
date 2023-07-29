import { Button } from "@/components/ui/button";
import configFirebase from "@/config/firebase";
import { functionInstance } from "@/config/firebase-instance";
import { UserContext } from "@/context/user";
import { arrayRemove, arrayUnion, doc, getFirestore, increment, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useContext, useEffect, useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { useMutation } from "react-query";

type Props = {
    count?: any[];
    idContent?: any;
    type: "musics" | "videos" | "photos";
    mode: "view" | "action";
    refresh: () => void;
};

const likingContent = httpsCallable(functionInstance, "likingContent");

const LikeButton = ({ count = [], mode, idContent, type, refresh }: Props) => {
    const { state, fetcherUser } = useContext(UserContext);
    const [tempLike, setTempLike] = useState(false);

    const likingContentMutate = useMutation(async () => {
        return (await likingContent({ type, idContent, uid: state?.user?.uid })).data;
    });

    useEffect(() => {
        setTempLike(!!count?.find((c) => c?.uid === state?.user?.uid));
    }, []);

    const onClick = async () => {
        if (!state?.user) return;
        setTempLike((prev) => !prev);
        likingContentMutate.mutate();
        refresh();
    };

    return (
        <Button disabled={!state?.user?.id} onClick={onClick} title={mode === "view" ? "Disukai" : "Sukai video"} variant="default" size="sm">
            <AiFillHeart
                className={`text-lg mr-3 ${state?.user?.lovedContent?.includes(idContent) || tempLike ? "text-pink-500" : "text-white opacity-50"}`}
            />
            <span className={state?.user?.lovedContent?.includes(idContent) || tempLike ? "text-pink-500" : ""}>{count?.length}</span>
        </Button>
    );
};

export default LikeButton;
