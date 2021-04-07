const nodemailer = require("nodemailer");
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.POSTGRES_CONN,
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();
const addInvoiceToDb = async (
  uid,
  date,
  id,
  email,
  name,
  currency,
  receipt_url,
  amount
) => {
  const query = {
    name: "invoice",
    text:
      "INSERT INTO orders (uid,p_date,p_id,email,name,currency,receipt_url,amount) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING uid",
    values: [uid, date, id, email, name, currency, receipt_url, amount],
  };
  try {
    const result = await client.query(query);
    console.log(result);
  } catch (err) {
    console.log(err);
  }
};

module.exports = addInvoiceToDb;
