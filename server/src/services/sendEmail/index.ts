import nodemailer from 'nodemailer';

export default async function sendEmail([subject, mainHTML]: [string, string], to: string, from: string) {

    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.sendinblue.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const info = await transporter.sendMail({
        from,
        to,
        subject,
        html: mainHTML
    });
}