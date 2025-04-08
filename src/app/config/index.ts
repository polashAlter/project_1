import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

export default {
    NODE_ENV: process.env.NODE_ENV as string,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL as string,
    // default_pass: process.env.DEFAULT_PASS,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
    jwt_access_expiry: process.env.JWT_ACCESS_EXPIRES_IN as string,
    jwt_refresh_expiry: process.env.JWT_REFRESH_EXPIRES_IN as string,
    emailSender: {
        app_email: process.env.APP_EMAIL as string,
        app_pass: process.env.APP_PASS as string,
    },
    resetPassword: {
        reset_link: process.env.RESET_LINK as string,
        reset_link_expires_in: process.env.RESET_LINK_EXPIRES_IN as string,
        reset_pass_secret: process.env.RESET_PASS_SECRET as string,
    },
    google: {
        redirect_url: process.env.GOOGLE_REDIRECT_URL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
    },
    client_url: process.env.CLIENT_BASE_URL,
    timeZone: process.env.TIMEZONE,
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
    ssl: {
        storeId: process.env.SSL_STORE_ID,
        storePass: process.env.SSL_STORE_PASS,
        is_live: process.env.SSL_IS_LIVE,
    },
    base_url: process.env.BASE_URL,
    super_admin: {
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
        name: process.env.SUPER_ADMIN_NAME,
    },
};
