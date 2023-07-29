import { UserData } from "@/models";
import HTMLReactParser from "html-react-parser";
import { memo } from "react";

type Props = {
    user?: UserData;
};
const About = ({ user }: Props) => {
    return (
        <div className="w-[50vw] mt-10">
            <div className="flex flex-col gap-3 mb-10">
                <h2 className="text-xl font-semibold">Profesi</h2>
                <p className="text-lg">
                    {(user?.profession || "-")?.CapitalizeEachFirstLetter()} {user?.location ? user?.location?.CapitalizeEachFirstLetter() : ""}
                </p>
            </div>
            <div className="flex flex-col gap-3 mb-10">
                <h2 className="text-xl font-semibold">Biografi</h2>
                <div className="bg-slate-50 p-4 rounded-sm">{HTMLReactParser(user?.bio || "-")}</div>
            </div>
            <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Portofolio</h2>
                <div className="bg-slate-50 p-4 rounded-sm">
                    <a href={user?.personalWebUrl}>{user?.personalWebUrl}</a> <br />
                    <a href={user?.portfolioUrl}>{user?.portfolioUrl}</a>
                </div>
            </div>
        </div>
    );
};

export default memo(About);
