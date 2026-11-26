import nodemailer, { type Transporter } from "nodemailer";

/**
 * Outgoing email over SMTP (HUB_SMTP_* in .env.local / the hosting dashboard).
 * With no HUB_SMTP_HOST nothing is sent and only the subject + recipient domain are logged,
 * so local development works without a mail server. Sending never throws: an email failure
 * must not fail the request that triggered it (the in-app notification is already saved).
 */

let transport: Transporter | null | undefined;

function getTransport(): Transporter | null {
  if (transport !== undefined) return transport;
  const host = process.env.HUB_SMTP_HOST;
  if (!host) return (transport = null);
  const port = Number(process.env.HUB_SMTP_PORT || 465);
  transport = nodemailer.createTransport({
    host,
    port,
    // Port 465 = implicit TLS; 587 = STARTTLS (secure false, upgraded by nodemailer).
    secure: (process.env.HUB_SMTP_SECURE ?? String(port === 465)) === "true",
    auth: process.env.HUB_SMTP_USER ? { user: process.env.HUB_SMTP_USER, pass: process.env.HUB_SMTP_PASSWORD ?? "" } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
  return transport;
}

export function mailEnabled() {
  return getTransport() !== null;
}

/** Absolute link into the hub for emails. */
export function hubUrl(path: string) {
  const base = (process.env.HUB_PUBLIC_URL || "http://localhost:4100").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

const domain = (to: string) => to.split("@")[1]?.toLowerCase() ?? "?";

export async function sendMail(m: { to: string; subject: string; text: string }): Promise<boolean> {
  const t = getTransport();
  if (!t) {
    console.warn(`[hub] email "${m.subject}" to *@${domain(m.to)} not sent: set HUB_SMTP_HOST to enable email`);
    return false;
  }
  try {
    await t.sendMail({
      from: process.env.HUB_SMTP_FROM || process.env.HUB_SMTP_USER,
      to: m.to,
      subject: m.subject,
      text: m.text,
    });
    return true;
  } catch (err) {
    // Never log the body: reset emails carry a one-time link.
    console.error(`[hub] email "${m.subject}" to *@${domain(m.to)} failed:`, (err as Error).message);
    return false;
  }
}
