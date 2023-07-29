import { Button, ButtonProps } from "@/components/ui/button";
import { functionInstance } from "@/config/firebase-instance";
import { UserContext } from "@/context/user";
import { httpsCallable } from "firebase/functions";
import { memo, useContext } from "react";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { useMutation } from "react-query";

type Props = ButtonProps & {
    count?: number;
    idContent?: any;
    path: "musics" | "videos" | "photos";
    refresh: () => void;
};

const downloadContent = httpsCallable(functionInstance, "downloadContent");

const DownloadButton = ({ refresh, count = 0, idContent, path, ...rest }: Props) => {
    const { state } = useContext(UserContext);

    const likingContentMutate = useMutation(async () => {
        return (await downloadContent({ type: path, idContent, uid: state?.user?.uid })).data;
    });

    const onClick = (e: any) => {
        if (state?.user) {
            likingContentMutate.mutate();
        }
        if (rest?.onClick) {
            rest?.onClick(e);
        }
        refresh();
    };

    return (
        <Button {...rest} onClick={onClick}>
            <FaCloudDownloadAlt className="text-white opacity-50 text-lg mr-3" />
            {count}
        </Button>
    );
};
export default memo(DownloadButton);
