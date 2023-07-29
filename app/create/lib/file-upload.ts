import { storageInstance } from "@/config/firebase-instance";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable, uploadString } from "firebase/storage";
import { PhotoInfo, PhotoType } from "../photo/components/photo";
import { v4 as uuidv4 } from "uuid";
import { MusicType } from "../music/components/music";

export interface ImageUploaded extends PhotoInfo {
    name: string;
    image: string;
}

export const fileUploadByte = async ({ file, name, path }: { file: File; name: any; path: any }) => {
    const storageRef = ref(storageInstance, path + "/" + name);
    const upload = await uploadBytesResumable(storageRef, file);
    const downloadUrl = await getDownloadURL(upload.ref);
    return downloadUrl;
};

export const fileUploadString = async ({ file, name, path }: { file: string; name: any; path: any }) => {
    const storageRef = ref(storageInstance, path + "/" + name);
    const upload = await uploadString(storageRef, file, "data_url");
    const downloadUrl = await getDownloadURL(upload.ref);
    return downloadUrl;
};

export const thumbnailsUploadString = async (photos: string[]) => {
    const requests = await Promise.all(photos.map((photo) => fileUploadString({ file: photo, name: uuidv4(), path: "thumbnails" })));
    return requests;
};

export const thumbnailsUploadByte = async (photos: File[]) => {
    const requests = await Promise.all(photos.map((photo) => fileUploadByte({ file: photo, name: uuidv4(), path: "thumbnails" })));
    return requests;
};

export const photosUpload = async (photos: PhotoType[]) => {
    const requests = await Promise.all(
        photos.map((photo) => fileUploadByte({ file: photo.originFileObj as File, name: photo.name, path: "photos" }))
    );
    return photos?.map((photo, i) => ({
        name: photo.name,
        image: requests[i],
        location: photo?.location,
        tag: photo?.tag,
        description: photo?.description,
    })) as ImageUploaded[];
};

export const musicsUpload = async (musics: (MusicType & File)[]) => {
    const uploadMusic = await Promise.all(
        musics.map((music) => fileUploadByte({ file: music.originFileObj as File, name: music.name, path: "musics" }))
    );
    const uploadThumbnail = await thumbnailsUploadByte(musics.map((music) => music.thumbnail!));
    return musics.map((_, i) => ({
        name: musics[i].name,
        thumbnail: uploadThumbnail[i],
        tag: musics[i].tag,
        lyrics: musics[i].lyrics,
        music: uploadMusic[i],
    }));
};
