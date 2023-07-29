import { FirebaseStorage, ref, uploadBytesResumable } from "firebase/storage";
import BaseService from "./base";

class StorageFirebase extends BaseService {
    storage: FirebaseStorage;

    constructor(storage: FirebaseStorage) {
        super();
        this.storage = storage;
    }

    uploadFile({ file, path }: { file: File; path: string }) {
        const pathRef = ref(this.storage, path);
        const uploadTask = uploadBytesResumable(pathRef, file, { contentType: file.type });
        return uploadTask;
    }
}

export default StorageFirebase;
