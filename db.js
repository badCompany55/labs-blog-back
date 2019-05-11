const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on("connect", () => {
  console.log("connected to the db");
});

const createTables = async () => {
  const queryPostText = `CREATE TABLE IF NOT EXISTS
	posts(
	id SERIAL PRIMARY KEY,
	title VARCHAR(128) NOT NULL,
	author VARCHAR(128) NOT NULL,
	body VARCHAR(2000) NOT NULL,
	created_at TIMESTAMP,
	modified_at TIMESTAMP
	)
	`;

  const queryCommentText = `CREATE TABLE IF NOT EXISTS
	comments(
	id SERIAL PRIMARY KEY,
	post_id INTEGER REFERENCES posts(id),
	comment VARCHAR(128) NOT NULL,
	created_at TIMESTAMP,
	modified_at TIMESTAMP
	)
	`;

  try {
    const createPostsTable = await pool.query(queryPostText);
    const createCommentsTable = await pool.query(queryCommentText);
    console.log(createPostsTable);
    console.log(createCommentsTable);
    await pool.end();
  } catch (err) {
    console.log(err);
    await pool.end();
  }
};

const dropTables = async () => {
  const queryPostText = `DROP TABLE IF EXISTS posts`;
  const queryCommentText = `DROP TABLE IF EXISTS comments`;
  try {
    const deleteCommentsTable = await pool.query(queryCommentText);
    const deletePostsTable = await pool.query(queryPostText);
    console.log(deletePostsTable);
    console.log(deleteCommentsTable);
    await pool.end();
  } catch (err) {
    console.log(err);
    await pool.end();
  }
};

pool.on("remove", () => {
  console.log("client removed");
  process.exit(0);
});

module.exports = {
  createTables,
  dropTables
};

require("make-runnable");
