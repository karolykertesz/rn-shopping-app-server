const nodemailer = require("nodemailer");
const { Client } = require("pg");
const path = require("path");
var hbs = require("nodemailer-express-handlebars");
const client = new Client({
  connectionString: process.env.POSTGRES_CONN,
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();

const sendEmail = async (name, uid) => {
  try {
    let query = {
      name: "email",
      text: "SELECT email FROM users WHERE uid= $1",
      values: [uid],
    };
    const response = await client.query(query);
    const { email } = await response.rows[0];
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
    transporter
      .sendMail({
        from: process.env.NODEMAILER,
        to: email,
        subject: "Thank You",
        text: `Dear ${name}`,
        template: "main",
        context: { name: "RN-shopping" },
      })
      .then(console.log("Done"))
      .then(client.end())
      .catch((err) => console.log(err))
      .then(client.end());
  } catch (err) {
    console.log(err);
    client.end();
  }
};

module.exports = sendEmail;
