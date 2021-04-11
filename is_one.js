const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.POSTGRES_CONN,
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();
const check_is_exist = async (e) => {
  try {
    let query = {
      name: "find",
      text: "SELECT uid,email FROM users WHERE email = $1",
      values: [e],
    };
    const resp = await client.query(query);
    if (resp["rowCount"] > 0) {
      return resp.rows[0];
    } else {
      return null;
    }
  } catch (err) {
    return err.stack;
  }
};

module.exports = check_is_exist;
