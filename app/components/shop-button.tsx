import { Button } from "@/components/ui/button";
import { ConfigContext } from "@/context/config";
import { UserContext } from "@/context/user";
import { ChatInfo } from "@/models";
import { useRouter } from "next-nprogress-bar";
import { useContext } from "react";
import { AiOutlineShopping } from "react-icons/ai";

type Props = {
    disabled?: boolean;
    chatInfo: ChatInfo;
};

function ShopButton({ disabled, chatInfo }: Props) {
    const { setChatActive } = useContext(ConfigContext);
    const { state } = useContext(UserContext);
    const router = useRouter();

    const onClickChatHandler = () => {
        if (setChatActive) {
            setChatActive(chatInfo);
            router.push("/chat");
        }
    };

    if (!state?.user) return null;

    return (
        <Button disabled={disabled} onClick={onClickChatHandler} title="Pesan Karya" variant="default" size="sm" className="bg-green-500">
            <AiOutlineShopping className="text-white text-lg mr-3" />
            Pesan Karya
        </Button>
    );
}

export default ShopButton;
