const express = require("express");
const router = express.Router();
const { Client } = require("pg");
const check_is_exist = require("./is_one");
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const client = new Client({
  connectionString: process.env.POSTGRES_CONN,
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();
router.post(
  "/signin",
  body("email").isEmail().trim().notEmpty(),
  body("password").notEmpty().trim().escape(),
  async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let query = {
      name: "signup",
      text:
        "SELECT u.uid,u.email,u.admin,u.password,s.address,s.city,s.zip,s.country,s.state FROM users as u LEFT JOIN shipping AS s on u.uid = s.uid WHERE u.email = $1",
      values: [email],
    };
    try {
      const response = await client.query(query);
      if (response.rowCount < 1) {
        return res.status(400).json({ msg: "Invalid credencial" });
      }
      let pass = await response.rows[0]["password"];
      const returnRes = await bcrypt.compareSync(password, pass);
      if (returnRes) {
        const { email, uid, admin, city, country, state, zip } = await response
          .rows[0];
        return res.status(200).send({
          email,
          uid,
          accessToken: uuidv4(),
          city,
          country,
          state,
          zip,
          isAdmin: admin,
          isDone: city !== null ? true : false,
        });
      } else {
        return res.status(400).send({ msg: "Invalid credencial" });
      }
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = router;
