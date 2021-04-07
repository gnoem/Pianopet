import * as path from "path";
import handlebars from "handlebars";
import { promises as fs } from "fs";
import sgMail from "@sendgrid/mail";
import { handle } from "../utils.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const __dirname = path.resolve(path.dirname(''));

const readHTMLFile = (path) => {
    return fs.readFile(path, { encoding: 'utf-8' }, (err, html) => {
        if (err) throw err;
        return html;
    });
}

export const sendPasswordResetEmail = async ({ to, subject, resetLink }) => {
    console.dir(__dirname);
    const string = process.env.NODE_ENV === 'production'
        ? '../controllers/email/passwordReset.html'
        : './server/app/controllers/email/passwordReset.html';
    const html = await readHTMLFile(path.resolve(__dirname, string));
    const template = handlebars.compile(html);
    const replacements = {
        email: to,
        resetLink
    };
    const htmlToSend = template(replacements);
    const [_, sendMessageError] = await handle(sgMail.send({
        from: `"Pianopet" <contact@ngw.dev>`,
        to,
        subject, // todo add plaintext option
        html: htmlToSend
    }));
    if (sendMessageError) throw new Error(sendMessageError);
    return `Sent password recovery email to ${to}`;
}