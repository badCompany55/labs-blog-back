const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const query = async (text, params) => {
  try {
    const returnData = await new Promise((resolve, reject) => {
      pool.query(text, params, function(err, rQuery) {
        if (err) reject(err);
        resolve(rQuery);
      });
    });
    return returnData;
  } catch (err) {
    console.log(err);
  }
};

module.exports = query;
