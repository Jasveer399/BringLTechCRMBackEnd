import nodemailer from "nodemailer";

export const onMailer = async (email, epmId, password) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODE_MAILER_EMAIL,
      pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.NODE_MAILER_EMAIL,
    to: email,
    subject: "For Login",
    text: `Login with This \nEmployee Id:-${epmId} \n Employee Password:-${password}`,
  };
  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return false;
    } else {
      console.log("Email sent: " + info.response);
      return true;
    }
  });
};
