// const moment = require("moment");
// ;
// const { body, validationResult } = require("express-validator");
// const { Client } = require("pg");

//  const client = new Client({
//   connectionString: process.env.POSTGRES_CONN,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });
// export const addUser =(id,email,name ) => {
//     body("id").notEmpty().trim().isLength({ min: 2 }).escape(),
//     body("email").notEmpty().trim().escape().isEmail(),
//     body("name").notEmpty().trim().isLength({ min: 2 }).escape(),
// };