const { Pool } = require("pg");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jwtKey = process.env.JWT_SECRET;
const user = require("./data/models/posts.js").getUser;
const db = require("./data/db_config.js");

async function createHash(pass, salt) {
  try {
    const newHash = await new Promise((res, rej) => {
      bcrypt.hash(pass, salt, function(err, hash) {
        if (err) rej(err);
        res(hash);
      });
    });
    return newHash;
  } catch (err) {
    console.log(err);
  }
}

async function checkHash(pass, userPass) {
  try {
    const loginCheck = await new Promise((res, rej) => {
      bcrypt.compare(pass, userPass, function(err, pass) {
        if (err) rej(err);
        res(pass);
      });
    });
    return loginCheck;
  } catch (err) {
    console.log(err);
  }
}

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

  const queryUsersText = `CREATE TABLE IF NOT EXISTS
	users(
	id SERIAL PRIMARY KEY,
	username VARCHAR(128) NOT NULL,
	password VARCHAR(500) NOT NULL
	)
	`;

  try {
    const createPostsTable = await pool.query(queryPostText);
    const createCommentsTable = await pool.query(queryCommentText);
    const createUsersTable = await pool.query(queryUsersText);
    console.log(createPostsTable);
    console.log(createCommentsTable);
    console.log(createUsersTable);
    await pool.end();
  } catch (err) {
    console.log(err);
    await pool.end();
  }
};

const addUser = async () => {
  const text = `INSERT INTO
	users(username, password)
	VALUES($1,$2)
	returning *
	`;
  try {
    const hash = await createHash("zachTheMan", 10);
    const values = ["badCompany110", hash];
    const { rows } = await db(text, values);
    console.log(rows);
  } catch (err) {
    console.log(err);
  }
};

const dropTables = async () => {
  const queryPostText = `DROP TABLE IF EXISTS posts`;
  const queryCommentText = `DROP TABLE IF EXISTS comments`;
  const queryUsersText = `DROP TABLE IF EXISTS users`;
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
  dropTables,
  checkHash,
  addUser
};

require("make-runnable");
