import { Button } from "@/components/ui/button";
import { functionInstance } from "@/config/firebase-instance";
import { UserContext } from "@/context/user";
import { httpsCallable } from "firebase/functions";
import { useContext, useEffect } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { useMutation } from "react-query";

type Props = {
    count?: any[];
    idContent?: any;
    type: "musics" | "videos" | "photos";
};

const viewContent = httpsCallable(functionInstance, "viewContent");

const ViewButton = ({ count = [], idContent, type }: Props) => {
    const { state } = useContext(UserContext);

    const likingContentMutate = useMutation(async () => {
        return (await viewContent({ type, idContent, uid: state?.user?.uid })).data;
    });

    useEffect(() => {
        (async () => {
            if (!state?.user) return;
            likingContentMutate.mutate();
        })();
    }, []);

    return (
        <Button title="Dilihat" variant="default" size="sm" className="cursor-default">
            <AiOutlineEye className={`text-lg mr-3 text-white`} />
            <span className="text-white">{count?.length}</span>
        </Button>
    );
};

export default ViewButton;
