
import jwt from 'jsonwebtoken';
export const genrateAuthToken = (user) => {

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
        throw new Error("Secret key is not defined in environment variables");
    }
    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            name: user.name,
        },
        secretKey,
        { expiresIn: "1h" } // Token expiration time
    );
    return token;
}
