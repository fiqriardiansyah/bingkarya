import { DataMessage } from "@/app/lib/chat/models";
import { createChatId, removeDashes } from "@/lib/utils";
import { ChatInfo, IDs } from "@/models";
import { FirebaseApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { UploadTask, getDownloadURL } from "firebase/storage";
import { v4 as uuid } from "uuid";
import FirestoreService from "./firestore";
import configFirebase from "@/config/firebase";

class ChatService extends FirestoreService {
    config: FirebaseApp;

    constructor({ config, db }: { config: FirebaseApp; db: Firestore }) {
        super(db);
        this.db = db;
        this.config = config;
    }

    async SendMessage({
        data,
        uid,
        uid2,
        anyid,
        anytitle,
        link,
    }: Pick<IDs, "uid" | "uid2" | "anyid"> & {
        data: DataMessage;
        anytitle: string;
        link: string;
    }) {
        const uids = [uid, uid2];
        const chatId = createChatId({ uids, postfix: anyid });
        const id = uuid();
        const time = new Date().getTime();

        return this.ProxyRequest(async () => {
            uids.forEach((el, i) => {
                this.realtimeDatabase?.updateInfoChatUser({
                    cid: chatId,
                    uid: el,
                    data: {
                        cid: chatId,
                        anytitle,
                        anyid,
                        last_chat: time,
                        last_message: data.message,
                        uid: i === 0 ? uids[1] : uids[0],
                        type: data.typeFile || "text",
                        link,
                    },
                });
            });
            await this.addMessage({
                chatId,
                chatDoc: {
                    anytitle,
                    participants: [uid, uid2],
                    anyid,
                    last_update: time,
                },
                message: {
                    date: time,
                    file: "",
                    id: removeDashes(id),
                    message: data.message,
                    senderUid: uid,
                    typeFile: data.typeFile,
                    statusFile: data.file ? "uploading" : "none",
                    nameFile: data.file?.name || "",
                },
            });
            return removeDashes(id);
        });
    }

    async AddLinkFileToMessage(
        {
            mid,
            uploadTask,
            cid,
        }: Pick<IDs, "mid" | "cid"> & {
            uploadTask: UploadTask;
        },
        callback: () => void
    ) {
        return this.ProxyRequest(async () => {
            const url = await getDownloadURL((await uploadTask).ref);
            await this.updateMessage({
                cid,
                mid,
                data: {
                    statusFile: "uploaded",
                    file: url,
                },
            });
            callback();
        });
    }
}

const chatService = new ChatService({
    config: configFirebase.app,
    db: getFirestore(configFirebase.app),
});
export default chatService;
