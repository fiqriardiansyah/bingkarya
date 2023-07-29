const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const { FieldValue } = require("firebase-admin/firestore");

admin.initializeApp();

const createCookie = async (idToken) => {
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
        expiresIn,
    });

    const cookies = {
        name: "session",
        value: sessionCookie,
        expires: expiresIn,
        secure: true,
    };

    return cookies;
};
//
exports.checkUsername = functions.https.onCall(async (data) => {
    try {
        const userCollRef = admin.firestore().collection("users");
        const getUser = await userCollRef.where("username", "==", data.username).get();
        if (getUser.size) {
            throw new functions.https.HttpsError("already-exists", "username sudah dipakai");
        }

        return { username: data.username };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.createAccount = functions.https.onCall(async (data) => {
    try {
        const userCollRef = admin.firestore().collection("users");
        const getUser = await userCollRef.where("uid", "==", data?.uid).get();
        if (!getUser.size) {
            await userCollRef.add({ username: data.username, uid: data?.uid, profileImg: data?.profileImg });
        }
        const cookies = await createCookie(data.idToken);
        return { cookies };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getCookies = functions.https.onCall(async (data) => {
    try {
        const cookies = await createCookie(data.idToken);
        return { cookies };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});
//
exports.getUser = functions.https.onCall(async ({ uid }) => {
    try {
        const userCollRef = admin.firestore().collection("users");
        const userRecord = await admin.auth().getUser(uid);
        const req = await userCollRef.where("uid", "==", userRecord.uid).get();
        let user;
        req?.forEach((doc) => {
            user = {
                ...doc.data(),
                ...userRecord,
                id: doc.id,
            };
        });

        return user || null;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.createPhoto = functions.https.onCall(async (data) => {
    try {
        const photosCollRef = admin.firestore().collection("photos");
        const albumId = uuidv4();
        data?.photos?.map((photo) => {
            photosCollRef.add({
                uid: data?.uid,
                uploadDate: new Date().getTime(),
                ...photo,
                type: data?.type,
                komersil: data?.komersil,
                art: "photo",
                ...(data?.type === "album"
                    ? {
                          albumId,
                          albumName: data?.name,
                          albumDescription: data?.description,
                          albumLocation: data?.location,
                          albumTag: data?.tag,
                          albumItemCount: data?.photos?.length,
                      }
                    : {}),
            });
        });

        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.createVideo = functions.https.onCall(async (data) => {
    try {
        const thumbnailsCollRef = admin.firestore().collection("thumbnails");
        const videoCollRef = admin.firestore().collection("videos");

        const uploadDate = new Date().getTime();

        const videoRef = await videoCollRef.add({
            video: data.urlVideo,
            name: data?.name,
            description: data?.description,
            tag: data?.tag,
            location: data?.location,
            uploadDate,
            uid: data?.uid,
            komersil: data?.komersil,
            thumbnails: data?.thumbnails,
            mainThumbnail: data?.mainThumbnail,
            art: "video",
        });

        data?.thumbnails?.map((t) => {
            thumbnailsCollRef.add({
                image: t,
                videoId: videoRef.id,
                type: "thumbnails",
                uploadDate,
            });
        });

        await thumbnailsCollRef.add({
            image: data?.mainThumbnail,
            videoId: videoRef.id,
            type: "main-thumbnail",
            uploadDate,
        });
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.createMusic = functions.https.onCall(async (data) => {
    try {
        const musicCollRef = admin.firestore().collection("musics");

        const uploadDate = new Date().getTime();
        const albumId = uuidv4();

        data?.music?.map((music) => {
            musicCollRef.add({
                ...music,
                uploadDate,
                uid: data?.uid,
                type: data?.type,
                komersil: data?.komersil,
                art: "music",
                ...(data?.type === "album"
                    ? {
                          albumId,
                          albumName: data?.name,
                          albumLyrics: data?.lyrics,
                          albumTag: data?.tag,
                          albumThumbnail: data?.thumbnail,
                          albumItemCount: data?.music?.length,
                      }
                    : {}),
            });
        });
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getMyPhotos = functions.https.onCall(async (data) => {
    try {
        const photosCollRef = admin.firestore().collection("photos");
        const req = await photosCollRef.where("uid", "==", data.uid).orderBy("uploadDate", "desc").get();
        const photos = [];
        req?.forEach((doc) => {
            photos.push({
                id: doc.id,
                ...doc.data(),
                art: "photo",
            });
        });
        return { photos };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getMyVideos = functions.https.onCall(async (data) => {
    try {
        const videosCollRef = admin.firestore().collection("videos");
        const req = await videosCollRef.where("uid", "==", data.uid).orderBy("uploadDate", "desc").get();
        const videos = [];
        req?.forEach((doc) => {
            videos.push({
                id: doc.id,
                ...doc.data(),
                art: "video",
            });
        });
        return { videos };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getMyMusic = functions.https.onCall(async (data) => {
    try {
        const musicCollRef = admin.firestore().collection("musics");
        const req = await musicCollRef.where("uid", "==", data.uid).orderBy("uploadDate", "desc").get();
        const musics = [];
        req?.forEach((doc) => {
            musics.push({
                id: doc.id,
                ...doc.data(),
                art: "music",
            });
        });
        return { musics };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.deleteMusic = functions.https.onCall(async (data) => {
    try {
        const musicCollRef = admin.firestore().collection("musics");
        await musicCollRef.doc(data.id).delete();
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.deletePhoto = functions.https.onCall(async (data) => {
    try {
        const photoCollRef = admin.firestore().collection("photos");
        await photoCollRef.doc(data.id).delete();
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.deleteVideo = functions.https.onCall(async (data) => {
    try {
        const videoCollRef = admin.firestore().collection("videos");
        await videoCollRef.doc(data.id).delete();
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.homePageContent = functions.https.onCall(async (data) => {
    try {
        const videoCollRef = admin.firestore().collection("videos");
        const photoCollRef = admin.firestore().collection("photos");
        const musicCollRef = admin.firestore().collection("musics");
        // const userCollRef = admin.firestore().collection("users");

        const videos = [];
        const musics = [];
        let photos = [];

        const getVideo = videoCollRef.orderBy("uploadDate", "asc");
        const getMusic = musicCollRef.orderBy("uploadDate", "asc");
        const getPhoto = photoCollRef.orderBy("uploadDate", "asc");

        const reqAll = await Promise.all([getVideo, getMusic, getPhoto].map((el) => el.get()));
        reqAll[0].forEach((doc) => {
            videos.push({ id: doc.id, ...doc.data(), art: "video" });
        });

        reqAll[1].forEach((doc) => {
            const alreadyPush = musics.find((el) => (doc.data().albumId ? el.albumId === doc.data().albumId : false));
            if (!alreadyPush) {
                musics.push({ id: doc.id, ...doc.data(), art: "music" });
            }
        });

        reqAll[2].forEach((doc) => {
            const alreadyPush = photos.find((el) => (doc.data().albumId ? el.albumId === doc.data().albumId : false));
            if (!alreadyPush) {
                photos.push({ id: doc.id, ...doc.data(), art: "photo" });
            } else {
                photos = photos.map((p) => {
                    if (p.id !== alreadyPush.id) return p;
                    return {
                        ...p,
                        list: [...(p?.list || []), doc.data().image],
                    };
                });
            }
        });

        const list = [...videos, ...musics, ...photos].sort((a, b) => b.uploadDate - a.uploadDate);
        if (data?.q) {
            const query = data?.q?.toLowerCase();
            return {
                list: list?.filter((el) => {
                    return (
                        el.name?.toLowerCase().includes(query) ||
                        el?.tag?.join(" ")?.includes(query) ||
                        el?.albumTag?.join(" ")?.includes(query) ||
                        el?.description?.toString()?.toLowerCase()?.includes(query) ||
                        el?.location?.toString()?.toLowerCase()?.includes(query)
                    );
                }),
            };
        }
        //
        return { list };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getUser = functions.https.onCall(async (data) => {
    try {
        const userCollRef = admin.firestore().collection("users");
        const userAuth = await admin.auth().getUser(data.uid);
        const getUser = await userCollRef.where("uid", "==", data.uid).get();
        if (!getUser.size) {
            throw new functions.https.HttpsError("not-found", "user tidak ditemukan");
        }

        let user;
        getUser.forEach((doc) => {
            user = {
                id: doc.id,
                ...doc.data(),
                ...userAuth,
            };
        });
        return user;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getMusicDetail = functions.https.onCall(async (data) => {
    try {
        const musicCollRef = admin.firestore().collection("musics");
        const music = musicCollRef.doc(data.id);
        const likingCollRef = musicCollRef.doc(data.id).collection("liking");
        const viewCollRef = musicCollRef.doc(data.id).collection("viewer");

        const promisses = await Promise.all([music, likingCollRef, viewCollRef].map((q) => q.get()));
        const musicRes = promisses[0];
        const likingRes = promisses[1];
        const viewingRes = promisses[2];

        let liking = [];
        likingRes?.forEach((doc) => liking.push(doc.data()));

        let viewer = [];
        viewingRes?.forEach((doc) => viewer.push(doc.data()));

        if (!musicRes.exists) return null;

        if (musicRes.data().albumId) {
            const getAlbums = await musicCollRef.where("albumId", "==", musicRes.data().albumId).get();
            const musics = [];
            getAlbums.forEach((doc) => {
                musics.push({ id: doc.id, ...doc.data() });
            });
            return {
                id: musicRes.id,
                ...musicRes.data(),
                list: musics,
                loveCount: liking,
                viewCount: viewer,
            };
        }

        return {
            id: musicRes.id,
            ...musicRes.data(),
            loveCount: liking,
            viewCount: viewer,
        };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getPhotoDetail = functions.https.onCall(async (data) => {
    try {
        const photoCollRef = admin.firestore().collection("photos");
        const photo = photoCollRef.doc(data.id);
        const likingCollRef = photoCollRef.doc(data.id).collection("liking");
        const viewCollRef = photoCollRef.doc(data.id).collection("viewer");

        const promisses = await Promise.all([photo, likingCollRef, viewCollRef].map((q) => q.get()));
        const photoRes = promisses[0];
        const likingRes = promisses[1];
        const viewingRes = promisses[2];

        let liking = [];
        likingRes?.forEach((doc) => liking.push(doc.data()));

        let viewer = [];
        viewingRes?.forEach((doc) => viewer.push(doc.data()));

        if (!photoRes.exists) return null;

        if (photoRes.data().albumId) {
            const getAlbums = await photoCollRef.where("albumId", "==", photoRes.data().albumId).get();
            const photos = [];
            getAlbums.forEach((doc) => {
                photos.push({ id: doc.id, ...doc.data() });
            });
            return {
                id: photoRes.id,
                ...photoRes.data(),
                list: photos,
                loveCount: liking,
                viewCount: viewer,
            };
        }

        return {
            id: photoRes.id,
            ...photoRes.data(),
            loveCount: liking,
            viewCount: viewer,
        };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getVideoDetail = functions.https.onCall(async (data) => {
    try {
        const videoCollRef = admin.firestore().collection("videos");
        const video = videoCollRef.doc(data.id);
        const likingCollRef = videoCollRef.doc(data.id).collection("liking");
        const viewCollRef = videoCollRef.doc(data.id).collection("viewer");

        const promisses = await Promise.all([video, likingCollRef, viewCollRef].map((q) => q.get()));
        const videoRes = promisses[0];
        const likingRes = promisses[1];
        const viewingRes = promisses[2];

        let liking = [];
        likingRes?.forEach((doc) => liking.push(doc.data()));

        let viewer = [];
        viewingRes?.forEach((doc) => viewer.push(doc.data()));

        if (!videoRes.exists) return null;
        return {
            id: videoRes.id,
            ...videoRes.data(),
            loveCount: liking,
            viewCount: viewer,
        };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.updateAccount = functions.https.onCall(async (data) => {
    try {
        await admin.auth().updateUser(data.uid, data.update);
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.editProfile = functions.https.onCall(async (data) => {
    try {
        await admin.firestore().collection("users").doc(data.id).update(data.update);
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getOtherProfile = functions.https.onCall(async (data) => {
    try {
        const userCollref = admin.firestore().collection("users");
        const getUser = await userCollref.where("uid", "==", data.uid).get();
        let user;
        if (!getUser.size) {
            throw new functions.https.HttpsError("not-found", "not found");
        }
        getUser.forEach((doc) => {
            user = {
                ...doc.data(),
                id: doc.id,
            };
        });
        return { user };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getUserCollection = functions.https.onCall(async (data) => {
    try {
        const videoCollRef = admin.firestore().collection("videos");
        const photoCollRef = admin.firestore().collection("photos");
        const musicCollRef = admin.firestore().collection("musics");

        const videos = [];
        const musics = [];
        let photos = [];

        const getVideo = videoCollRef.where("uid", "==", data.uid).orderBy("uploadDate", "asc");
        const getMusic = musicCollRef.where("uid", "==", data.uid).orderBy("uploadDate", "asc");
        const getPhoto = photoCollRef.where("uid", "==", data.uid).orderBy("uploadDate", "asc");

        const reqAll = await Promise.all([getVideo, getMusic, getPhoto].map((el) => el.get()));
        reqAll[0].forEach((doc) => {
            videos.push({ id: doc.id, ...doc.data() });
        });

        reqAll[1].forEach((doc) => {
            const alreadyPush = musics.find((el) => (doc.data().albumId ? el.albumId === doc.data().albumId : false));
            if (!alreadyPush) {
                musics.push({ id: doc.id, ...doc.data() });
            }
        });

        reqAll[2].forEach((doc) => {
            const alreadyPush = photos.find((el) => (doc.data().albumId ? el.albumId === doc.data().albumId : false));
            if (!alreadyPush) {
                photos.push({ id: doc.id, ...doc.data() });
            } else {
                photos = photos.map((p) => {
                    if (p.id !== alreadyPush.id) return p;
                    return {
                        ...p,
                        list: [...(p?.list || []), doc.data().image],
                    };
                });
            }
        });

        return { list: [...videos, ...musics, ...photos].sort((a, b) => a.uploadDate - b.uploadDate) };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.likingContent = functions.https.onCall(async (data) => {
    try {
        const userCollref = admin.firestore().collection("users");
        const docRef = admin.firestore().collection(data.type).doc(data.idContent);
        const getContent = await docRef.get();
        const getOwner = await userCollref.where("uid", "==", getContent.data().uid).get();
        const getUser = await userCollref.where("uid", "==", data.uid).get();

        const collRef = docRef.collection("liking");
        const alreadyLike = await collRef.where("uid", "==", data.uid).get();
        if (alreadyLike.size) {
            let prev;
            alreadyLike.forEach((doc) => (prev = { id: doc.id, ...doc.data() }));
            await collRef.doc(prev.id).delete();
            getOwner.forEach((doc) => {
                userCollref.doc(doc.id).update({
                    like: FieldValue.increment(-1),
                });
            });
            getUser.forEach((doc) => {
                userCollref.doc(doc.id).update({
                    favoriteContent: FieldValue.arrayRemove({ type: data.type, id: data.idContent }),
                });
            });
            return { success: true };
        }
        getOwner.forEach((doc) => {
            userCollref.doc(doc.id).update({
                like: FieldValue.increment(1),
            });
        });
        getUser.forEach((doc) => {
            userCollref.doc(doc.id).update({
                favoriteContent: FieldValue.arrayUnion({ type: data.type, id: data.idContent }),
            });
        });
        await collRef.add({ uid: data.uid, id: data.idContent, path: data.type });
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.viewContent = functions.https.onCall(async (data) => {
    try {
        const userCollref = admin.firestore().collection("users");
        const docRef = admin.firestore().collection(data.type).doc(data.idContent);
        const collRef = docRef.collection("viewer");

        const getContent = await docRef.get();
        const getUser = await userCollref.where("uid", "==", getContent.data().uid).get();

        const alreadyView = await collRef.where("uid", "==", data.uid).get();
        if (alreadyView.size) return { success: true };
        getUser.forEach((doc) => {
            userCollref.doc(doc.id).update({
                view: FieldValue.increment(1),
            });
        });
        await collRef.add({ uid: data.uid, id: data.idContent, path: data.type });
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.downloadContent = functions.https.onCall(async (data) => {
    try {
        const userCollref = admin.firestore().collection("users");
        const docRef = admin.firestore().collection(data.type).doc(data.idContent);
        const getContent = await docRef.get();
        const getUser = await userCollref.where("uid", "==", getContent.data().uid).get();

        getUser.forEach((doc) => {
            userCollref.doc(doc.id).update({
                download: FieldValue.increment(1),
            });
        });
        await docRef.update({
            downloadCount: FieldValue.increment(1),
        });
        return { success: true };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getFavorites = functions.https.onCall(async (data) => {
    try {
        const db = admin.firestore();
        const queries = data?.favorites?.map((fav) => db.collection(fav.type).doc(fav.id));

        const result = [];
        const request = await Promise.all(queries.map((q) => q.get()));
        request.forEach((req) => {
            const row = req.data();
            result.push({ id: req.id, ...row });
        });
        return { list: result };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getPopularContent = functions.https.onCall(async () => {
    try {
        const db = admin.firestore();
        const paths = [db.collection("musics"), db.collection("photos"), db.collection("videos")];
        const requests = await Promise.all(paths.map((q) => q.get()));
        const queries = requests?.map((req, i) => {
            const queries = [];
            req.forEach((doc) => {
                queries.push(paths[i].doc(doc.id).collection("liking"));
                queries.push(paths[i].doc(doc.id).collection("viewer"));
            });
            return queries;
        });
        const requestQueries = await Promise.all(queries.flat(Infinity).map((q) => q.get()));
        const result = requestQueries
            ?.map((req) => {
                const res = [];
                req?.forEach((doc) => {
                    res.push(doc.data());
                });
                return res;
            })
            .filter((e) => e.length)
            .flat(Infinity);

        const grouping = result?.reduce((a, b) => {
            return {
                ...a,
                [b.id]: Object.keys(a).length ? (a[b.id] || 0) + 1 : 1,
            };
        }, {});

        const sorting = Object.keys(grouping)
            .map((key) => ({ id: key, value: grouping[key] }))
            .sort((a, b) => b.value - a.value);

        if (!sorting.length) return null;

        const content = result.find((c) => c.id === sorting[0].id);
        const getContent = await db.collection(content.path).doc(content.id).get();

        return { result: { id: getContent.id, ...getContent.data() } };
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});

exports.getShortProfile = functions.https.onCall(async (data) => {
    try {
        const userCollRef = admin.firestore().collection("users");
        const getUser = await userCollRef.where("uid", "==", data.uid).get();
        let user;
        getUser.forEach((doc) => {
            const data = doc.data();
            user = {
                id: doc.id,
                username: data.username,
                profileImg: data.profileImg,
                uid: data.uid,
            };
        });
        return user;
    } catch (e) {
        throw new functions.https.HttpsError("unknown", e?.message);
    }
});
