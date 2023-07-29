import { getDatabase } from "firebase/database";
import { Firestore, collection, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { ChatDoc, IDs, MessageBuble } from "@/models";
import BaseService from "./base";
import RealtimeDatabase from "./database";
import configFirebase from "@/config/firebase";

class FirestoreService extends BaseService {
    db: Firestore;
    chats = "chats";
    messages = "messages";
    realtimeDatabase: RealtimeDatabase | null = null;

    constructor(db: Firestore) {
        super();
        this.db = db;
        this.realtimeDatabase = new RealtimeDatabase(getDatabase(configFirebase.app));
    }

    addMessage({ message, chatId, chatDoc }: { message: MessageBuble; chatId: string; chatDoc: ChatDoc }) {
        const collectionRef = doc(this.db, this.chats, chatId, this.messages, message.id);
        const docRef = doc(this.db, this.chats, chatId);
        setDoc(docRef, { ...chatDoc });
        return setDoc(collectionRef, message);
    }

    _observeMyMessage({
        cid,
        callback,
    }: Pick<IDs, "cid"> & {
        callback: (messages: MessageBuble[]) => void;
    }) {
        const queryRef = query(collection(this.db, this.chats, cid, this.messages), orderBy("date"));
        const unsub = onSnapshot(queryRef, (snapshot) => {
            const messages: MessageBuble[] = [];
            snapshot.forEach((d) => {
                messages.push(d.data() as MessageBuble);
            });
            callback(messages);
        });
    }

    updateMessage({
        cid,
        mid,
        data,
    }: Pick<IDs, "mid" | "cid"> & {
        data: Partial<MessageBuble>;
    }) {
        const docRef = doc(this.db, this.chats, cid, this.messages, mid);
        return updateDoc(docRef, data);
    }
}

export default FirestoreService;
