import { Resend } from "resend";

const resendUrl = process.env.RESEND_API_KEY;
const resend = new Resend(resendUrl);

export const sendOtpEmail = async (to: string, otp: string) => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: "Your BookingSphere Password Reset Code",
    html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  });
};
