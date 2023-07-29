import { Button } from "@/components/ui/button";
import configFirebase from "@/config/firebase";
import { UserContext } from "@/context/user";
import { doc, getFirestore, increment, updateDoc } from "firebase/firestore";
import { useContext, useEffect } from "react";
import { AiOutlinePlayCircle } from "react-icons/ai";

type Props = {
    count?: any;
    idContent?: any;
    type: "musics" | "videos" | "photos";
};

const PlayButton = ({ count = 0, idContent, type }: Props) => {
    const { state } = useContext(UserContext);

    useEffect(() => {
        (async () => {
            if (!state?.user) return;

            const db = getFirestore(configFirebase.app);
            await updateDoc(doc(db, type, idContent), {
                playCount: increment(1),
            });
        })();
    }, []);

    return (
        <Button title="Diputar" variant="default" size="sm" className="cursor-default">
            <AiOutlinePlayCircle className={`text-lg mr-3 text-white`} />
            <span className="text-white">{count}</span>
        </Button>
    );
};

export default PlayButton;
