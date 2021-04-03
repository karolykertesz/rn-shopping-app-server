require("dotenv").config();
const moment = require("moment");
const express = require("express");
const bodyParser = require("body-parser");
const stripe = require("./stripe");
const newCard = require("./create_new_card");
const getAll = require("./getAll");
const one = require("./one");
const createuser = require("./createuser");
const { body, validationResult } = require("express-validator");
const port = process.env.PORT || 6000;

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api", stripe);
app.use("/apiadd", newCard);
app.use("/getall", getAll);
app.use("/one", one);
app.use("/createuser", createuser);

const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.POSTGRES_CONN,
  ssl: {
    rejectUnauthorized: false,
  },
});

const text = "SELECT pid,title,description,price,url FROM products";

const currDate = moment().format("YYYY/MM/DD");

app.get("/productsget", (request, response) => {
  client.connect();
  client
    .query(text)
    .then((res) => response.send(JSON.stringify(res.rows)))
    .then((re) => {
      if (re.status < 400) {
        console.log("Done");
        // client.end();
      }
    })
    .catch((e) => console.log(e));
});

app.post(
  "/products",
  body("title").notEmpty().trim().isLength({ min: 2 }).escape(),
  body("description").notEmpty().trim().escape().isLength({ min: 6 }),
  body("url").notEmpty().isURL(),
  body("price"),
  (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const url = req.body.url;
    const price = req.body.price;
    const text =
      "INSERT INTO products (title,description,url,price,created_on,category) VALUES($1,$2,$3,$4,$5,$6) RETURNING *";
    const values = [title, description, url, price, currDate, "w3"];

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    client.connect();
    client
      .query(text, values)
      .then((resp) => {
        res.send(JSON.stringify(resp.rows[0]));
      })

      .catch((err) => {
        console.log(err);
        client.end();
      });
  }
);
app.post(
  "/update",
  body("id").notEmpty().trim().escape(),
  body("title").notEmpty().trim().isLength({ min: 2 }).escape(),
  body("description").notEmpty().trim().escape().isLength({ min: 6 }),
  body("url").notEmpty().isURL(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array() })
        .then(client.end());
    }
    const id = req.body.id;
    const title = req.body.title;
    const description = req.body.description;
    const url = req.body.url;
    client.connect();
    let query = {
      name: "update",
      text:
        "UPDATE products SET title  = $1, description = $2, url = $3 WHERE pid = $4 RETURNING *",
      values: [title, description, url, id],
    };

    client
      .query(query)
      .then((resp) => res.send(JSON.stringify(resp.rows[0])))
      .catch((err) => console.log(err));
  }
);
app.post("/delete", body("id").notEmpty().trim().escape(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  client.connect();
  const id = req.body.id;
  const query = {
    name: "delete",
    text: "DELETE FROM products WHERE pid = $1",
    values: [id],
  };
  client
    .query(query)
    .then((re) => res.send(re.status))
    .catch((err) => console.log(err));
});

app.listen(process.env.PORT, () =>
  console.log(`listening on ${process.env.PORT}`)
);
