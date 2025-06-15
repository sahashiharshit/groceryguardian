
import jwt from 'jsonwebtoken';




export const generateAuthToken = (id: string): string => {

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
        throw new Error("Secret key is not defined in environment variables.");
    }
    const token = jwt.sign(
        {
            id,
        },
        secretKey,
        { expiresIn: "1h" } // Token expiration time
    );
    return token;
}

export const generateRefreshToken = (id: string): string => {

    const secretKey = process.env.REFRESH_SECRET_KEY;
    if (!secretKey) {
        throw new Error("Secret key is not defined in environment variables.");
    }
    const token = jwt.sign(

        {
            id,
        },
        secretKey,
        { expiresIn: "7d" }
    );
    return token;

}
