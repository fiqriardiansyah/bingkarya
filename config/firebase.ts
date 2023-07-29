import { FirebaseApp, initializeApp } from "firebase/app";

class ConfigFirebase {
    firebaseConfig: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        databaseURL: string;
        appId: string;
    };

    app: FirebaseApp;

    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyAm_vKEq1zeCPuYf1YA2O7JoPxpQvZMJzs",
            authDomain: "bingkai-karya.firebaseapp.com",
            databaseURL: "https://bingkai-karya-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "bingkai-karya",
            storageBucket: "bingkai-karya.appspot.com",
            messagingSenderId: "928444495897",
            appId: "1:928444495897:web:ab16332e0a72f8e5891288",
        };
        this.app = initializeApp(this.firebaseConfig);
    }
}

const configFirebase = new ConfigFirebase();
export default configFirebase;
