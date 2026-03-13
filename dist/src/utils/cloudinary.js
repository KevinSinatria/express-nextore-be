import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
cloudinary.config({
    cloud_name: env("CLOUDINARY_CLOUD_NAME"),
    api_key: env("CLOUDINARY_API_KEY"),
    api_secret: env("CLOUDINARY_API_SECRET"),
});
export const uploadImage = async (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: `nextore/${folder}` }, (error, result) => {
            if (error)
                return reject(error);
            resolve(result?.secure_url || "");
        });
        uploadStream.end(fileBuffer);
    });
};
export const deleteImage = async (imageUrl) => {
    try {
        const parts = imageUrl.split("/");
        const uploadIndex = parts.indexOf("upload");
        const publicIdWithFolders = parts
            .slice(uploadIndex + 2)
            .join("/")
            .split(".")[0];
        const result = await cloudinary.uploader.destroy(publicIdWithFolders);
        if (result.result === "not found") {
            console.warn("Image not found on Cloudinary.");
        }
        else {
            console.log("Image deleted successfully:", result);
        }
    }
    catch (error) {
        console.error("Failed to delete image on Cloudinary:", error);
    }
};
//# sourceMappingURL=cloudinary.js.map