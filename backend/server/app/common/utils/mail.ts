import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export interface MailPayload {
  to: string;
  subject: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  service: env.MAIL_SERVICE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  family: 4, // Force IPv4 to avoid ENETUNREACH on Node 18+ (Render/Docker)
} as any);

// Internal use only - used by Trigger.dev task
export const sendEmailDirectly = async (
  payload: MailPayload,
): Promise<void> => {
  await transporter.sendMail({
    from: env.EMAIL_USER,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
  });
};

import { tasks } from "@trigger.dev/sdk/v3";
import type { emailTask } from "../../trigger/email.task.js"; // Import type only to avoid cycle, usually trigger client uses string IDs or imported task object

// This will be replaced by the trigger call
export const sendEmail = async (payload: MailPayload): Promise<void> => {
  // Dynamic import to avoid circular dependency issues if any
  const { emailTask } = await import("../../trigger/email.task.js");
  await emailTask.trigger(payload);
};
