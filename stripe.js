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
  "/newcustomer",
  body("email").notEmpty().trim().escape().isEmail(),
  body("name").notEmpty().isLength({ min: 2 }).escape(),
  async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;

    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      stripe.customers
        .create({
          email,
          name,
        })
        .then((customer) => {
          try {
            const text =
              "INSERT INTO customers (cid,email,name) VALUES($1,$2,$3) RETURNING *";
            const values = [customer.id, customer.email, customer.name];
            client.query(text, values).then((resp) => {
              res.send(JSON.stringify(resp.rows[0]));
            });
          } catch (err) {
            res.status(400);
            client.end();
          }
        });
    } catch (error) {
      return res.status(400).send({ Error: error.raw });
    }
  }
);
module.exports = router;
