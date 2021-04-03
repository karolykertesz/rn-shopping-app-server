const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);

router.get("/getall", async (req, res) => {
  const customerId = "cus_JDBTMOArHsWfC2";
  let cards = [];
  try {
    const savedcards = await stripe.customers.listSources(customerId, {
      object: "card",
    });
    const cardDetails = Object.values(savedcards.data);
    cardDetails.forEach((cardData) => {
      let obj = {
        cardId: cardData.id,
        cardType: cardData.brand,
        cardLast4: cardData.last4,
        cardName: cardData.name,
        country: cardData.country,
      };
      cards.push(obj);
    });
    return res.status(200).send({
      cardDetails: cards,
      //   car: cardData,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
