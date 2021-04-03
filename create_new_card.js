const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const { Client } = require("pg");
const client = new Client({
  connectionString: process.env.POSTGRES_CONN,
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();

router.post(
  "/addnewcard",
  body("cid").notEmpty().isLength({ min: 2, max: 25 }),
  async (req, res) => {
    const cid = req.body.cid;
    const cardNumber = req.body.cardnumber;
    const cardExpMonth = req.body.cardMonth;
    const cardExpYear = req.body.cardYear;
    const cvc = req.body.cardCvc;

    const error = validationResult(req);
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const query = {
      name: "fetch-user",
      text: "SELECT cid,name FROM customers WHERE cid = $1",
      values: [cid],
    };
    client
      .query(query)
      .then(async (res) => {
        const { name, cid } = res.rows[0];
        try {
          const cardToken = await stripe.tokens.create({
            card: {
              name,
              number: cardNumber,
              exp_month: cardExpMonth,
              exp_year: cardExpYear,
              cvc,
            },
          });
          const card = await stripe.customers.createSource(cid, {
            source: `${cardToken.id}`,
          });
        } catch (err) {
          console.log(err);
        }
      })
      .then((re) => res.send(re));
  }
);

module.exports = router;
