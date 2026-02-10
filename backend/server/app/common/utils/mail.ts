import nodemailer from "nodemailer";
import { env } from "../config/env.js";

interface MailPayload {
  to: string;
  subject: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  service: env.MAIL_SERVICE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

export const sendEmail = async (payload: MailPayload): Promise<void> => {
  await transporter.sendMail({
    from: env.EMAIL_USER,
    to: payload.to,
    subject: payload.subject,
    text: payload.text
  });
};
