const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.POSTGRES_CONN,
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();

router.post("/google", async (req, res) => {
  const email = req.body.email;
  const uid = req.body.uid;

  try {
    const query = {
      name: "check",
      text: "SELECT email FROM users WHERE email = $1",
      values: [email],
    };
    const response = await client.query(query);
    if (response.rowCount < 1) {
      const query = {
        name: "insert",
        text:
          "INSERT INTO users (uid,email,password,admin) VALUES ($1,$2,$3,$4)",
        values: [uid, email, "1234", false],
      };
      const resp = await client.query(query);
      return res.status(200).send({ message: "inserted" });
    } else {
      const query = {
        name: "checkAgain",
        text:
          "SELECT city,country,state,address,zip FROM shipping WHERE uid=$1",
        values: [uid],
      };

      const response = await client.query(query);
      const { city, country, state, address, zip } = await response.rows[0];
      return res.status(200).send({
        city: city || null,
        country: country || null,
        state: state || null,
        address: address || null,
        zip: zip || null,
        isDone: zip ? true : false,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "error" });
  }
});

module.exports = router;
