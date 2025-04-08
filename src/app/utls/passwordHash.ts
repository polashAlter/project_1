import bcrypt from "bcrypt";
import config from "../config";
import AppError from "../errors/AppError";

const hashPassword = async (password: string): Promise<string> => {
    try {
        return await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
    } catch (error) {
        console.error(error, "Error hashing password ....................");
        throw new AppError(500, "Something went wrong", error);
    }
};

const comparePassword = async (
    plainTextPassword: string,
    hashedPassword: string
): Promise<boolean> => {
    try {
        return await bcrypt.compare(plainTextPassword, hashedPassword);
    } catch (error) {
        console.error(error, "Error comparing passwords.................");
        throw new AppError(500, "Something went wrong", error);
    }
};

export const processPassword = {
    hashPassword,
    comparePassword,
};
