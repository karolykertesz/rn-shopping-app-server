const nodemailer = require("nodemailer");
const path = require("path");
var hbs = require("nodemailer-express-handlebars");

const sendEnvoice = async (
  name,
  email,
  date,
  recip_url,
  amount,
  city,
  address,
  zip,
  country,
  state
) => {
  const tax = 27;
  const totalWTax = (tax * amount) / 100 + amount;
  try {
    let transporter = await nodemailer.createTransport({
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
        defaultLayout: "ini.hbs",
      },
      viewPath: "./views/",
      extName: ".hbs",
    };
    transporter.use("compile", hbs(handlebarOptions));
    await transporter.sendMail({
      from: process.env.NODEMAILER,
      to: email,
      subject: `Dear ${name} Your Invoice from RN-SHOPPING_APP`,
      template: "ini",
      context: {
        name: `${name}`,
        totalWTax: totalWTax,
        amount: amount,
        link: recip_url,
        Date: date,
        city: city,
        address: address,
        zip: zip,
        country: country,
        state: state,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = sendEnvoice;
