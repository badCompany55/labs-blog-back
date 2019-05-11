const express = require("express");
const helm = require("helmet");
const cors = require("cors");
const posts = require("./data/models/posts.js");

const server = express();

server.use(express.json(), helm(), cors());

server.post("/newpost", posts.create);
server.get("/all", posts.getAll);
server.put("/post/:id", posts.edit);
server.delete("/post/:id", posts.deletepost);

module.exports = server;
