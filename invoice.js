const express = require("express");
const moment = require("moment");
const router = express.Router();
const { Client } = require("pg");
const { body, validationResult } = require("express-validator");
const sendEnvoice = require("./sendInvoice");
const client = new Client({
  connectionString: process.env.POSTGRES_CONN,
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();

router.post(
  "/invoce",
  body("p_id").notEmpty().trim().escape(),
  body("city").notEmpty().trim().escape(),
  body("address").notEmpty().trim().escape(),
  body("zip").notEmpty().trim().escape(),
  body("country").notEmpty().trim().escape(),
  body("state").notEmpty().trim().escape(),
  async (req, res) => {
    const p_id = req.body.p_id;
    const city = req.body.city;
    const address = req.body.address;
    const zip = req.body.zip;
    const country = req.body.country;
    const state = req.body.state;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const query = {
        name: "pid",
        text:
          "SELECT email,name,receipt_url,amount FROM orders WHERE p_id=$1",
        values: [p_id],
      };
      const response = await client.query(query);
      const date = moment().format("YYYY/MM/DD");
      const { email, name, receipt_url, amount} = await response
        .rows[0];
      sendEnvoice(
        name,
        email,
        date,
        receipt_url,
        amount,
        city,
        address,
        zip,
        country,
        state
      ).then(res.send({ msg: "succes" }));
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = router;
