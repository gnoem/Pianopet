import nodemailer from "nodemailer";
import { handle } from "./utils.js";

export const sendPasswordResetEmail = async ({ to, subject, text, html }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
        }
    }); 
    const [message, sendMessageError] = await handle(transporter.sendMail({
        from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_ADDRESS}>`,
        to,
        subject,
        text,
        html
    }));
    if (sendMessageError) throw new Error(sendMessageError);
    return nodemailer.getTestMessageUrl(message);
}