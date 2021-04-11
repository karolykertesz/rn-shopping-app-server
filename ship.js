const express = require("express");
const router = express.Router();
const { Client } = require("pg");
const { body, validationResult } = require("express-validator");
const client = new Client({
  connectionString: process.env.POSTGRES_CONN,
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();

router.post(
  "/ship",
  body("uid").trim().notEmpty().escape(),
  body("city").notEmpty().trim().escape(),
  body("address").notEmpty().trim().escape(),
  body("zip").notEmpty().trim().escape(),
  body("country").notEmpty().trim().escape(),
  body("state").notEmpty().trim().escape(),
  body("updateS").notEmpty().isBoolean(),
  async (req, res) => {
    const uid = req.body.uid;
    const city = req.body.city;
    const address = req.body.address;
    const zip = req.body.zip;
    const country = req.body.country;
    const state = req.body.state;
    const updateS = req.body.updateS;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (updateS) {
      const query = {
        name: "update",
        text:
          "UPDATE shipping SET city = $1, address = $2,zip = $3 ,country = $4 ,state = $5 WHERE uid = $6 RETURNING uid",
        values: [city, address, zip, country, state, uid],
      };

      try {
        const response = await client.query(query);
        console.log(response.rows[0]);
        return res.status(200).send({ result: "shipping Updated" });
      } catch (err) {
        console.log(err.stack);
      }
    } else {
      const query = {
        name: "insert",
        text:
          "INSERT INTO shipping (uid,city,address,zip,country,state) VALUES ($1,$2,$3,$4,$5,$6) RETURNING city",
        values: [uid, city, address, zip, country, state],
      };
      try {
        const response = await client.query(query);
        return res.status(200).send({ result: "shipping set" });
      } catch (err) {
        console.log(err.stack);
      }
    }
  }
);

module.exports = router;
