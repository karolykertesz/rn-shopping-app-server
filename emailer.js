const nodemailer = require("nodemailer");
const path = require("path");
var hbs = require("nodemailer-express-handlebars");

const sendEmail = async (name, email) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      secure: false,
      port: 587,
      auth: {
        user: process.env.NODEMAILER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const handlebarOptions = {
      viewEngine: {
        extName: ".hbs",
        partialsDir: "./views",
        layoutsDir: "./views",
        defaultLayout: "main.hbs",
      },
      viewPath: "./views/",
      extName: ".hbs",
    };
    transporter.use("compile", hbs(handlebarOptions));
    transporter.sendMail({
      from: process.env.NODEMAILER,
      to: email,
      subject: "Thank You",
      text: `Dear ${name}`,
      template: "main",
      context: { from: "RN-shopping", name: `${name}` },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendEmail;
