import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Instabels <noreply@instabels.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${APP_URL}/reset-password/${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your Instabels password",
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;">
        <div style="margin-bottom:24px;">
          <span style="font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Instabels</span>
        </div>

        <h1 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 12px;">Reset your password</h1>
        <p style="font-size:15px;color:#475569;margin:0 0 28px;line-height:1.6;">
          We received a request to reset your password. Click the button below to choose a new one.
          This link expires in <strong>1 hour</strong>.
        </p>

        <a href="${link}"
           style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#a855f7);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:999px;">
          Reset Password
        </a>

        <p style="font-size:13px;color:#94a3b8;margin:28px 0 0;line-height:1.6;">
          If you didn't request this, you can safely ignore this email — your password won't change.
        </p>

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
        <p style="font-size:12px;color:#cbd5e1;margin:0;">
          Instabels · Professional buffet labeling for hospitality teams
        </p>
      </div>
    `,
  });
}

export async function sendOrgInviteEmail(
  email: string,
  token: string,
  orgName: string,
  invitedByName: string
) {
  const link = `${APP_URL}/api/org/invite/accept/${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `You've been invited to join ${orgName} on Instabels`,
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;">
        <div style="margin-bottom:24px;">
          <img src="${APP_URL}/logo.png" alt="Instabels" width="160" style="display:block;height:auto;" />
        </div>

        <h1 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 12px;">You're invited to join ${orgName}</h1>
        <p style="font-size:15px;color:#475569;margin:0 0 28px;line-height:1.6;">
          <strong>${invitedByName}</strong> has invited you to join <strong>${orgName}</strong> on Instabels —
          a professional buffet label tool for hospitality teams. Click the button below to accept your invitation.
          This link expires in <strong>7 days</strong>.
        </p>

        <a href="${link}"
           style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#a855f7);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:999px;">
          Accept Invitation
        </a>

        <p style="font-size:13px;color:#94a3b8;margin:28px 0 0;line-height:1.6;">
          If you weren't expecting this invitation, you can safely ignore this email.
        </p>

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
        <p style="font-size:12px;color:#cbd5e1;margin:0;">
          Instabels · Professional buffet labeling for hospitality teams
        </p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${APP_URL}/verify-email/${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your Instabels email",
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;">
        <div style="margin-bottom:24px;">
          <span style="font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">Instabels</span>
        </div>

        <h1 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 12px;">Verify your email</h1>
        <p style="font-size:15px;color:#475569;margin:0 0 28px;line-height:1.6;">
          Thanks for signing up! Click the button below to verify your email address and activate your account.
          This link expires in <strong>24 hours</strong>.
        </p>

        <a href="${link}"
           style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#a855f7);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:999px;">
          Verify Email
        </a>

        <p style="font-size:13px;color:#94a3b8;margin:28px 0 0;line-height:1.6;">
          If you didn't create an Instabels account, you can safely ignore this email.
        </p>

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
        <p style="font-size:12px;color:#cbd5e1;margin:0;">
          Instabels · Professional buffet labeling for hospitality teams
        </p>
      </div>
    `,
  });
}
