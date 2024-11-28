const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

let posts = [
  { id: 1, content: "Hello, world!", likes: 0, comments: [] },
];

app.get("/posts", (req, res) => res.json(posts));

app.post("/posts", (req, res) => {
  const newPost = { id: Date.now(), content: req.body.content, likes: 0, comments: [] };
  posts.push(newPost);
  res.json(newPost);
});

app.put("/posts/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find((p) => p.id === id);
  if (post) {
    post.content = req.body.content;
    res.json(post);
  } else {
    res.status(404).send("Post not found");
  }
});

app.put("/posts/:id/like", (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find((p) => p.id === id);
  if (post) {
    post.likes++;
    res.json(post);
  } else {
    res.status(404).send("Post not found");
  }
});

app.post("/posts/:id/comments", (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find((p) => p.id === id);
  if (post) {
    post.comments.push(req.body.comment);
    res.json(post);
  } else {
    res.status(404).send("Post not found");
  }
});

app.delete("/posts/:id", (req, res) => {
  const id = parseInt(req.params.id);
  posts = posts.filter((p) => p.id !== id);
  res.send("Post deleted");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
