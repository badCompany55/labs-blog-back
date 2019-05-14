const moment = require("moment");
const db = require("../db_config.js");

async function create(req, res) {
  const { title, author, body } = req.body;
  const text = `INSERT INTO
		posts(title, author,body,created_at, modified_at)
		VALUES($1, $2, $3, $4, $5)
		returning *
		`;
  const values = [title, author, body, moment(new Date()), moment(new Date())];
  try {
    const rows = await db(text, values);
    console.log(rows.rows);
    res.status(201).json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
}

async function getUser(username) {
  try {
    const userquery = `SELECT * FROM users where username=$1`;
    const user = await db(userquery, [username]);
    return user;
  } catch (err) {
    console.log(err);
  }
}

async function getAll(req, res) {
  const getAll = `SELECT * FROM posts`;
  try {
    const rows = await db(getAll);
    res.status(200).json(rows.rows);
  } catch (err) {
    res.status(500).json(err);
  }
}

async function edit(req, res) {
  const { title, author, body } = req.body;
  const findpost = `SELECT * FROM posts WHERE id=$1`;
  const updatepost = `UPDATE posts 
	SET title=$1,author=$2,body=$3,modified_at=$4
	WHERE id=$5 returning *
		`;
  try {
    const { rows } = await db(findpost, [req.params.id]);
    if (!rows[0]) {
      res.status(404).json({ Error: "Post not found" });
    }
    const values = [
      title || rows[0].title,
      author || rows[0].author,
      body || rows[0].body,
      moment(new Date()),
      req.params.id
    ];

    const updatedPost = await db(updatepost, values);
    console.log(updatedPost.rows);
    res.status(200).json(updatedPost.rows);
  } catch (err) {
    res.status(500).json(err);
  }
}

async function deletepost(req, res) {
  const deletepost = `DELETE FROM posts WHERE id=$1 returning *`;
  try {
    const { rows } = await db(deletepost, [req.params.id]);
    if (!rows[0]) {
      res
        .status(404)
        .json({ Error: `No post with the id of ${req.params.id}` });
    }
    res.status(204).json({ Message: "Post deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
}

module.exports = {
  create,
  getAll,
  edit,
  deletepost,
  getUser
};
