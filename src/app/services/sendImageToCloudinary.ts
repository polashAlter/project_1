import { v2 as cloudinary } from "cloudinary";
import config from "../config";

type TcloudinaryResponse = {
    public_id: string;
    url: string;
    secure_url: string;
    format: string;
    width: number;
    height: number;
    created_at: string;
    [key: string]: any;
};
// Configuration
cloudinary.config({
    cloud_name: config.cloudinary_cloud_name,
    api_key: config.cloudinary_api_key,
    api_secret: config.cloudinary_api_secret,
});

export const sendImageToCloudinary = (
    imageName: string,
    buffer: Buffer | string
): Promise<TcloudinaryResponse> => {
    // Upload an image from buffer
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { public_id: `N_HealthCare/${imageName}` },
            (err, result) => {
                if (err) return reject(err);
                resolve(result as TcloudinaryResponse);
            }
        );

        // Write the buffer to the upload stream
        uploadStream.end(buffer);
    });
};
