"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Upload } from "lucide-react";
import { useState } from "react";
import AlbumForm from "./album-form";
import { Switch } from "@/components/ui/switch";
import { PhotoInfo } from "./photo";
import { Label } from "@/components/ui/label";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

export type UploadType = "album" | "alone";
export interface PhotoInfoWithFile extends PhotoInfo {
    type: UploadType;
    komersil: boolean;
}
type Props = { onUpload: (value: PhotoInfoWithFile) => void; loading: boolean };

export default function Sidebar({ onUpload, loading }: Props) {
    const [type, setType] = useState<UploadType>("alone");
    const [komersil, setKomersil] = useState<boolean>(false);
    const onSubmitInfoAlbum = (values: any) => {
        onUpload({ ...values, type, komersil });
    };

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>Upload Karya fotografi</CardTitle>
            </CardHeader>
            <CardContent>
                <Select value={type} onValueChange={(val) => setType(val as any)}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Pilih metode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="album">Upload Sebagai Album</SelectItem>
                        <SelectItem value="alone">Upload Per Item</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex items-center space-x-2 my-3 mt-7">
                    <Switch checked={komersil} onCheckedChange={(c) => setKomersil(c)} id="komersil-switch" />
                    <Label htmlFor="komersil-switch">Tersedia untuk komersial</Label>
                </div>
                {komersil ? (
                    <p className="m-0 text-sm">
                        Kamu bisa membuat karyamu ditawar oleh orang lain. <br />
                        <span className="text-red-400">Hanya unggah karya contoh untuk komersial!</span>
                    </p>
                ) : null}
                <Separator className="my-5" />
                {type === "album" ? (
                    <AlbumForm
                        onSubmit={onSubmitInfoAlbum}
                        buttonSave={
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <Spin size="large" indicator={<LoadingOutlined className="text-white mr-3" style={{ fontSize: 20 }} spin />} />
                                ) : (
                                    <Upload className="mr-2 h-4 w-4" />
                                )}
                                Upload
                            </Button>
                        }
                    />
                ) : (
                    <Button type="button" onClick={() => onSubmitInfoAlbum({})} disabled={loading}>
                        {loading ? (
                            <Spin size="large" indicator={<LoadingOutlined className="text-white mr-3" style={{ fontSize: 20 }} spin />} />
                        ) : (
                            <Upload className="mr-2 h-4 w-4" />
                        )}
                        Upload
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
