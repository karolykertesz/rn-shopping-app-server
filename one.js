const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { body, validationResult } = require("express-validator");
const sendEmail = require("./emailer");
const addInvoiceToDb = require("./addInvoiceToDb");
const moment = require("moment");

router.post(
  "/onep",
  body("creditCard").notEmpty().escape().isCreditCard(),
  body("name").notEmpty().trim().isLength({ min: 2 }).escape(),
  body("cardMonth").notEmpty().escape(),
  body("cardYear").notEmpty().isInt().escape(),
  body("cardCvc").notEmpty().isInt().escape(),
  body("amount").notEmpty().isInt().escape(),
  body("uid").notEmpty().trim().escape(),
  body("email").isEmail().trim().notEmpty(),

  async (req, res) => {
    const creditCard = req.body.creditCard;
    const name = req.body.name;
    const cardMonth = req.body.cardMonth;
    const cardYear = req.body.cardYear;
    const cardCvc = req.body.cardCvc;
    const amount = req.body.amount;
    const uid = req.body.uid;
    const email = req.body.email;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const cardToken = await stripe.tokens.create({
        card: {
          number: creditCard,
          exp_month: cardMonth,
          exp_year: cardYear,
          cvc: cardCvc,
        },
      });

      const charge = await stripe.charges.create({
        amount: amount * 100,
        currency: "usd",
        source: cardToken.id,
        description: `Dear ${name} $${amount} has been charged for One Time Payment`,
        name: this.name,
      });

      if (charge.status === "succeeded") {
        const date = moment().format("YYYY/MM/DD");
        const { id, currency, receipt_url } = await charge;
        console.log(charge);
        await sendEmail(name, email).catch((err) => console.log(err));
        await addInvoiceToDb(
          uid,
          date,
          id,
          email,
          name,
          currency,
          receipt_url,
          amount
        ).catch((err) => console.log(err));
        return res.status(200).json({ p_id: id });
      } else {
        return res
          .status(400)
          .json({ Error: "Please try again later for One Time Payment" });
      }
    } catch (error) {
      return res.status(400).json({
        Error: error.raw,
      });
    }
  }
);

module.exports = router;
