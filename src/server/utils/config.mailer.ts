import nodemailer from 'nodemailer';

const { EMAIL_HOST, EMAIL_USERNAME, EMAIL_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  pool: true,
  host: EMAIL_HOST,
  port: 465,
  secure: true, // use TLS
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD
  }
});

export default transporter;
