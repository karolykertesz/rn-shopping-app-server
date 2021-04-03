const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { body, validationResult } = require("express-validator");

router.post(
  "/onep",
  body("creditCard").notEmpty().escape().isCreditCard(),
  body("name").notEmpty().trim().isLength({ min: 2 }).escape(),
  body("cardMonth").notEmpty().escape(),
  body("cardYear").notEmpty().isInt().escape(),
  body("cardCvc").notEmpty().isInt().escape(),
  body("amount").notEmpty().isInt().escape(),

  async (req, res) => {
    const creditCard = req.body.creditCard;
    const name = req.body.name;
    const cardMonth = req.body.cardMonth;
    const cardYear = req.body.cardYear;
    const cardCvc = req.body.cardCvc;
    const amount = req.body.amount;
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
        description: `Dear ${name} $${
          amount / 100
        } has been charged for One Time Payment`,
        name: this.name,
      });

      if (charge.status === "succeeded") {
        return res.status(200).send({ Success: charge });
      } else {
        return res
          .status(400)
          .send({ Error: "Please try again later for One Time Payment" });
      }
    } catch (error) {
      return res.status(400).send({
        Error: error.raw,
      });
    }
  }
);

module.exports = router;
