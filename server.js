const express = require("express");
const helm = require("helmet");
const cors = require("cors");
const posts = require("./data/models/posts.js");
const checkHash = require("./db.js").checkHash;
require("dotenv").config();
const jwtKey = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

const server = express();

server.use(express.json(), helm(), cors());

async function jwtCheck(req, res, next) {
  const token = req.get("authorize");
  if (token) {
    console.log(jwtKey);
    await jwt.verify(token, jwtKey, (err, decoded) => {
      if (err) {
        res.status(401).json(err);
      }
    });
    next();
  } else {
    res.status(400).json({ Error: "Not authorized" });
  }
}

async function login(req, res) {
  const { username, password } = req.body;
  const creds = req.body;
  if (username && password) {
    try {
      const query = await posts.getUser(username);
      const user = query.rows[0];
      if (user) {
        const loginCheck = await checkHash(password, user.password);
        if (loginCheck === true) {
          const payload = {
            id: user.id,
            username: user.username
          };
          const options = {
            expiresIn: "1d"
          };
          const token = await jwt.sign(payload, jwtKey, options);
          const obj = { token: token, id: user.id };
          res.status(200).json(obj);
        } else {
          res.status(401).json({ Error: "Invalid Credentials" });
        }
      } else {
        res.status(401).json({ Error: "Invalid Credentials" });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(422).json({ Error: "The username and password are required" });
  }
}

server.post("/login", login);
server.post("/newpost", jwtCheck, posts.create);
server.get("/all", jwtCheck, posts.getAll);
server.put("/post/:id", jwtCheck, posts.edit);
server.delete("/post/:id", jwtCheck, posts.deletepost);

module.exports = server;
