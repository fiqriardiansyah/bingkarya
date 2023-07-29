import { User } from "firebase/auth";
import { UploadTask } from "firebase/storage";

export interface UserData extends User {
    id: string;
    username: string;
    uid: string;
    profileImg: string;
    lovedContent?: string[];
    bio?: string;
    location?: string;
    personalWebUrl?: string;
    portfolioUrl?: string;
    profession?: string;
    like?: number;
    download?: number;
    view?: number;
    favoriteContent?: { id: any; type: "music" | "video" | "photo" }[];
}

export interface ShortProfile extends Pick<UserData, "id" | "username" | "uid" | "profileImg"> {}

export interface IDs {
    uid: string; // user id
    uid2: string; // other user id
    sid: string; // service id
    hid: string; // hero id
    oid: string; // order id
    rid: string; // request id
    pid: string; // poster id
    biid: string; // bid id
    apcid: string; // aplication id;
    anyid: string; // any other id;
    cid: string; // chat id
    mid: string; // message id
    rwid: string; // review id
}

export interface MessageBuble {
    id: string;
    date: any;
    file: any | null;
    typeFile: string | null;
    message: string;
    senderUid: string;
    statusFile: "uploading" | "uploaded" | "failed" | "none";
    nameFile: string;
}

export interface ChatDoc extends Pick<IDs, "anyid"> {
    participants: string[];
    anytitle: string;
    last_update: any;
}

export interface ChatInfo extends Pick<IDs, "uid" | "cid" | "anyid"> {
    id?: string;
    anytitle: string;
    type_work?: "service" | "poster";
    last_chat?: any;
    last_message?: string;
    type?: string;
    link?: string;
}

export interface TaskProgress extends Pick<IDs, "mid"> {
    progress: number;
    error: null | any;
    task: UploadTask;
}
