/**
 * TrustRent email notifications via Resend.
 * Set RESEND_API_KEY in your environment to enable.
 * If the key is missing, emails are silently skipped (no crash).
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "TrustRent <noreply@trustrent.africa>";

async function send(to: string, subject: string, html: string) {
  if (!resend) return; // email not configured — skip silently
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch {
    // Never crash the app because of a failed email
  }
}

// ─── Templates ───────────────────────────────────────────────────────────────

function base(body: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;background:#f8fafc;margin:0;padding:0">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
        <tr>
          <td style="background:#059669;padding:20px 32px">
            <span style="color:#fff;font-size:18px;font-weight:700">TrustRent</span>
          </td>
        </tr>
        <tr><td style="padding:32px">${body}</td></tr>
        <tr>
          <td style="background:#f1f5f9;padding:16px 32px;font-size:12px;color:#94a3b8">
            TrustRent — Africa's high-trust rental marketplace.<br>
            You're receiving this because you have an account on TrustRent.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(url: string, label: string) {
  return `<a href="${url}" style="display:inline-block;background:#059669;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:16px">${label}</a>`;
}

// ─── Application notifications ────────────────────────────────────────────────

export async function emailApplicationApproved(params: {
  tenantEmail: string;
  tenantName: string;
  propertyTitle: string;
  depositAmount: string;
  appUrl: string;
}) {
  await send(
    params.tenantEmail,
    `Your application for ${params.propertyTitle} has been approved 🎉`,
    base(`
      <h2 style="margin:0 0 8px;color:#0f172a">Congratulations, ${params.tenantName}!</h2>
      <p style="color:#475569;margin:0 0 16px">Your rental application for <strong>${params.propertyTitle}</strong> has been <strong style="color:#059669">approved</strong> by the landlord.</p>
      <p style="color:#475569;margin:0 0 8px">Next step: pay your security deposit of <strong>${params.depositAmount}</strong> into escrow to secure your new home.</p>
      ${btn(params.appUrl, "Pay Deposit Now")}
    `)
  );
}

export async function emailApplicationRejected(params: {
  tenantEmail: string;
  tenantName: string;
  propertyTitle: string;
  appUrl: string;
}) {
  await send(
    params.tenantEmail,
    `Update on your application for ${params.propertyTitle}`,
    base(`
      <h2 style="margin:0 0 8px;color:#0f172a">Hi ${params.tenantName},</h2>
      <p style="color:#475569;margin:0 0 16px">Unfortunately, the landlord has decided not to proceed with your application for <strong>${params.propertyTitle}</strong>.</p>
      <p style="color:#475569;margin:0 0 16px">Don't be discouraged — there are plenty of other properties available on TrustRent.</p>
      ${btn(params.appUrl, "Browse Properties")}
    `)
  );
}

export async function emailNewApplication(params: {
  landlordEmail: string;
  landlordName: string;
  tenantName: string;
  propertyTitle: string;
  appUrl: string;
}) {
  await send(
    params.landlordEmail,
    `New application for ${params.propertyTitle}`,
    base(`
      <h2 style="margin:0 0 8px;color:#0f172a">New Application Received</h2>
      <p style="color:#475569;margin:0 0 16px">Hi ${params.landlordName}, <strong>${params.tenantName}</strong> has submitted an application for your property <strong>${params.propertyTitle}</strong>.</p>
      <p style="color:#475569;margin:0 0 16px">Review their tenant passport to approve or decline.</p>
      ${btn(params.appUrl, "Review Application")}
    `)
  );
}

// ─── Payment / escrow notifications ──────────────────────────────────────────

export async function emailDepositPaid(params: {
  landlordEmail: string;
  landlordName: string;
  tenantName: string;
  propertyTitle: string;
  depositAmount: string;
  appUrl: string;
}) {
  await send(
    params.landlordEmail,
    `Deposit received for ${params.propertyTitle}`,
    base(`
      <h2 style="margin:0 0 8px;color:#0f172a">Deposit Held in Escrow</h2>
      <p style="color:#475569;margin:0 0 16px">Hi ${params.landlordName}, <strong>${params.tenantName}</strong> has paid a deposit of <strong>${params.depositAmount}</strong> for <strong>${params.propertyTitle}</strong>.</p>
      <p style="color:#475569;margin:0 0 16px">The funds are securely held in escrow and will be released to you once the tenant confirms their move-in.</p>
      ${btn(params.appUrl, "View Transactions")}
    `)
  );
}

export async function emailEscrowReleased(params: {
  landlordEmail: string;
  landlordName: string;
  amount: string;
  propertyTitle: string;
  appUrl: string;
}) {
  await send(
    params.landlordEmail,
    `Escrow funds released — ${params.propertyTitle}`,
    base(`
      <h2 style="margin:0 0 8px;color:#0f172a">Funds Released to You</h2>
      <p style="color:#475569;margin:0 0 16px">Hi ${params.landlordName}, the tenant has confirmed their move-in for <strong>${params.propertyTitle}</strong>.</p>
      <p style="color:#475569;margin:0 0 16px">Your deposit of <strong>${params.amount}</strong> has been released from escrow.</p>
      ${btn(params.appUrl, "View Transactions")}
    `)
  );
}

export async function emailDisputeOpened(params: {
  landlordEmail: string;
  landlordName: string;
  tenantName: string;
  propertyTitle: string;
  amount: string;
  adminUrl: string;
}) {
  await send(
    params.landlordEmail,
    `Dispute opened — ${params.propertyTitle}`,
    base(`
      <h2 style="margin:0 0 8px;color:#0f172a">A Dispute Has Been Raised</h2>
      <p style="color:#475569;margin:0 0 16px">Hi ${params.landlordName}, <strong>${params.tenantName}</strong> has opened a dispute on the deposit of <strong>${params.amount}</strong> for <strong>${params.propertyTitle}</strong>.</p>
      <p style="color:#475569;margin:0 0 16px">The TrustRent team will review the dispute and contact both parties within 1–2 business days.</p>
    `)
  );
}

export async function emailDisputeResolved(params: {
  recipientEmail: string;
  recipientName: string;
  propertyTitle: string;
  outcome: "released_to_landlord" | "refunded_to_tenant";
  amount: string;
  adminNotes: string;
  appUrl: string;
}) {
  const outcomeText =
    params.outcome === "released_to_landlord"
      ? "The funds have been released to the landlord."
      : "The funds have been refunded to the tenant.";

  await send(
    params.recipientEmail,
    `Dispute resolved — ${params.propertyTitle}`,
    base(`
      <h2 style="margin:0 0 8px;color:#0f172a">Dispute Resolved</h2>
      <p style="color:#475569;margin:0 0 16px">Hi ${params.recipientName}, the TrustRent team has resolved the dispute for <strong>${params.propertyTitle}</strong>.</p>
      <p style="color:#475569;margin:0 0 16px"><strong>Outcome:</strong> ${outcomeText}</p>
      <p style="color:#475569;margin:0 0 16px"><strong>Admin notes:</strong> ${params.adminNotes}</p>
      <p style="color:#475569;margin:0 0 16px">Amount: <strong>${params.amount}</strong></p>
      ${btn(params.appUrl, "View Details")}
    `)
  );
}

// ─── Verification notifications ───────────────────────────────────────────────

export async function emailLandlordVerified(params: {
  landlordEmail: string;
  landlordName: string;
  dashboardUrl: string;
}) {
  await send(
    params.landlordEmail,
    "You've been verified on TrustRent ✓",
    base(`
      <h2 style="margin:0 0 8px;color:#0f172a">Congratulations, ${params.landlordName}!</h2>
      <p style="color:#475569;margin:0 0 16px">Your identity and property documents have been reviewed and approved. Your listings now display the <strong style="color:#059669">TrustRent Verified</strong> badge.</p>
      <p style="color:#475569;margin:0 0 16px">Verified landlords receive significantly more tenant applications.</p>
      ${btn(params.dashboardUrl, "Go to Dashboard")}
    `)
  );
}

export async function emailLandlordRejected(params: {
  landlordEmail: string;
  landlordName: string;
  reason: string;
  verificationUrl: string;
}) {
  await send(
    params.landlordEmail,
    "Action required — verification update",
    base(`
      <h2 style="margin:0 0 8px;color:#0f172a">Verification Update</h2>
      <p style="color:#475569;margin:0 0 16px">Hi ${params.landlordName}, we were unable to verify your documents for the following reason:</p>
      <blockquote style="border-left:3px solid #e2e8f0;margin:0 0 16px;padding:8px 16px;color:#475569">${params.reason}</blockquote>
      <p style="color:#475569;margin:0 0 16px">Please re-upload the correct documents to continue the verification process.</p>
      ${btn(params.verificationUrl, "Re-upload Documents")}
    `)
  );
}
