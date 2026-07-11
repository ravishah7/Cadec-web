// frontend/src/hooks/useCloudinaryUpload.ts
//
// 1. Fetches a signed signature from our backend
// 2. POSTs the file directly to Cloudinary
// 3. Returns the secure URL

import { useState } from "react";
import api from "@/services/api";

interface SignatureResponse {
  success:   boolean;
  signature: string;
  timestamp: number;
  folder:    string;
  cloudName: string;
  apiKey:    string;
}

interface UploadResult {
  url:       string;
  publicId:  string;
  width:     number;
  height:    number;
}

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress,    setProgress]    = useState(0);

  const upload = async (
    file: File,
    folder = "cadec/gallery"
  ): Promise<UploadResult> => {
    setIsUploading(true);
    setProgress(0);

    try {
      // Step 1 — get signature from our backend
      const sigRes = await api.get<SignatureResponse>(
        `/api/upload/signature?folder=${encodeURIComponent(folder)}`
      );

      const { signature, timestamp, cloudName, apiKey, folder: signedFolder } =
        sigRes.data;

      // Step 2 — POST directly to Cloudinary
      const formData = new FormData();
      formData.append("file",       file);
      formData.append("api_key",    apiKey);
      formData.append("timestamp",  String(timestamp));
      formData.append("signature",  signature);
      formData.append("folder",     signedFolder);

      const cloudRes = await new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve({
              url:      data.secure_url,
              publicId: data.public_id,
              width:    data.width,
              height:   data.height,
            });
          } else {
            reject(new Error(`Cloudinary upload failed: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () =>
          reject(new Error("Upload network error"))
        );

        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
        );
        xhr.send(formData);
      });

      return cloudRes;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return { upload, isUploading, progress };
}