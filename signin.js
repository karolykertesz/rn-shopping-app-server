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
router.get(
  "/signin",
  body("email").isEmail().trim().notEmpty(),
  body("password").notEmpty().trim().escape(),
  async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array() })
        .then(client.end());
    }
    let query = {
      name: "signup",
      text: "SELECT email,uid,password FROM users WHERE email=$1",
      values: [email],
    };
    const response = await client.query(query);
    let pass = await response.rows[0]["password"];
    if (response.rowCount < 1) {
      return res.status(400).json({ msg: "Invalid credencial" });
    }
    const returnRes = await bcrypt.compareSync(password, pass);
    if (returnRes) {
      const { email, uid } = await response.rows[0];
      return res.status(200).json({ email, uid, accessToken: uuidv4() });
    } else {
      return res.status(401).json({ msg: "Invalid credencial" });
    }
  }
);

module.exports = router;
