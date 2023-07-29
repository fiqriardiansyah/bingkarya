import configFirebase from "./firebase";
import firebaseJSON from "@/firebase.json";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";

export const functionInstance = getFunctions(configFirebase.app);
export const authInstance = getAuth(configFirebase.app);
export const firestoreInstance = getFirestore(configFirebase.app);
export const storageInstance = getStorage(configFirebase.app);
export const databaseInstance = getDatabase(configFirebase.app);

if (process.env.NODE_ENV === "development") {
    connectAuthEmulator(authInstance, "http://localhost:" + firebaseJSON.emulators.auth.port);
    connectFunctionsEmulator(functionInstance, "localhost", +firebaseJSON.emulators.functions.port);
    connectFirestoreEmulator(firestoreInstance, "localhost", firebaseJSON.emulators.firestore.port);
    connectStorageEmulator(storageInstance, "localhost", firebaseJSON.emulators.storage.port);
    connectDatabaseEmulator(databaseInstance, "localhost", firebaseJSON.emulators.database.port);
}
