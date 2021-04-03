const express = require("express");
const router = express.Router();
const { Client } = require("pg");
const check_is_exist = require("./is_one");
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const client = new Client({
  connectionString: process.env.POSTGRES_CONN,
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();
router.post(
  "/create",
  body("email").isEmail().trim().notEmpty(),
  body("password").notEmpty().trim().isLength({ min: 6 }).escape(),
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
    const is_it_one = await check_is_exist(email);
    let uid = uuidv4();
    if (is_it_one !== null) {
      return res.status(200).send({
        uid: is_it_one.uid,
        email: is_it_one.email,
        error: "Already Signed Up!",
        accessToken: uuidv4(),
      });
    } else {
      let query = {
        name: "signup",
        text:
          "INSERT INTO users(uid,email,password) VALUES($1,$2,$3) RETURNING uid,email",
        values: [uid, email, password],
      };
      const response = await client.query(query);
      if (response.rowCount > 0) {
        const { uid, email } = response.rows[0];
        return res.status(200).send({ uid, email, accessToken: uuidv4() });
      } else {
        return res.status(400);
      }
    }
  }
);

module.exports = router;
