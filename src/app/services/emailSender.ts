import nodemailer from "nodemailer";
import config from "../config";

const emailSender = async (email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: config.emailSender.app_email,
      pass: config.emailSender.app_pass,
    },
  });

  const info = await transporter.sendMail({
    from: `Netra Healthcare ${config.emailSender.app_email} `, // sender address
    to: email, // list of receivers
    subject: "Reset Password Link",
    html, // html body
  });

  console.log("Message sent: %s", info.messageId);
};

export default emailSender;
