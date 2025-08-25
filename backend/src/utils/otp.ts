import crypto from "crypto";
import bcrypt from "bcrypt";

export function generateNumericOtp(length=6): string {
    let otp="";
    while(otp.length<length){
        otp+=Math.floor(crypto.randomInt(0, 10)).toString();
    }
    return otp;
}
export async function hashOtp(otp: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);    
}
export async function verifyOtp(otp:string,otphash:string):Promise<boolean>{

    return bcrypt.compare(otp, otphash);
}