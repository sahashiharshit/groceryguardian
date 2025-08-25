import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";
configDotenv();

const transporter = nodemailer.createTransport({

host:process.env.SMTP_HOST!,
port:Number(process.env.SMTP_PORT ||587),
secure:false,
auth:{
    user:process.env.SMTP_USER!,
    pass:process.env.SMTP_PASS!,
},

});

export async function sendSignupOtpEmail(to: string, name:string, otp: string): Promise<void> {
const appName=process.env.APP_NAME||"Grocery Guardian";
const html=`
    <div style="font-family:sans-serif">
      <h2>Verify your email</h2>
      <p>Hi ${name},</p>
      <p>Your ${appName} verification code is:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</p>
      <p>This code will expire in 10 minutes.</p>
    </div>
`;
    await transporter.sendMail({
        from: process.env.MAIL_FROM || `"${appName}"<no-reply@groceryguardian.duckdns.org>`,
        to,
        subject: `Verify your email - ${appName}`,
        html,
    });
}
export async function sendResetPasswordOtpEmail(to: string, name:string, otp: string): Promise<void> {
    const appName=process.env.APP_NAME||"Grocery Guardian";
    const html=`
        <div style="font-family:sans-serif">
          <h2>Reset your password</h2>
          <p>Hi ${name},</p>
          <p>Your ${appName} password reset code is:</p>
          <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</p>
          <p>This code will expire in 10 minutes.</p>
        </div>
    `;
        await transporter.sendMail({
            from: process.env.MAIL_FROM || `"${appName}"<no-reply@groceryguardian.duckdns.org>`,
            to,
            subject:`Reset your password - ${appName}`,
            html, 
    });
}