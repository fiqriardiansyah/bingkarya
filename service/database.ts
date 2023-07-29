import { parseTreeObjectToArray } from "@/lib/utils";
import { ChatInfo, IDs } from "@/models";
import { Database, onValue, orderByChild, query, ref, update } from "firebase/database";
import BaseService from "./base";

class RealtimeDatabase extends BaseService {
    db: Database;
    users = "users";

    constructor(db: Database) {
        super();
        this.db = db;
    }

    _observeMyChats({
        uid,
        callback,
    }: Pick<IDs, "uid"> & {
        callback: (data: ChatInfo[]) => void;
    }) {
        onValue(query(ref(this.db, `${this.users}/${uid}/chats`), orderByChild("last_chat")), (snapshot) => {
            if (!snapshot.exists()) {
                callback([]);
            }
            callback(parseTreeObjectToArray<ChatInfo>(snapshot.val()) || []);
        });
    }

    updateInfoChatUser({
        uid,
        cid,
        data,
    }: Pick<IDs, "uid" | "cid"> & {
        data: ChatInfo;
    }) {
        return update(ref(this.db, `${this.users}/${uid}/chats/${cid}`), data);
    }
}

export default RealtimeDatabase;
