const express = require("express");
const app = express();
const userModel = require("./models/user");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const postModel = require("./models/post");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const post = require("./models/post");
const upload = require("./config/multerconfig");
const user = require("./models/user");
const getAIResponse = require("./langchain_api/ask_ai");

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");

  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }

  await post.save();
  res.redirect("/profile");
});
app.get("/edit/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  res.render("edit", { post });
});
app.post("/update/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOneAndUpdate(
    { _id: req.params.id },
    {
      content: req.body.content,
    }
  );
  res.redirect("/profile");
});

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/profile/upload", (req, res) => {
  res.render("profilepic");
});
app.post("/upload", isLoggedIn, upload.single("image"), async (req, res) => {
  try {
    // Add await and proper error handling
    let user = await userModel.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating profile picture");
  }
});

app.post("/register", async (req, res) => {
  let { email, password, username, name, age } = req.body;
  let user = await userModel.findOne({ email });
  if (user) {
    return res.render("already_exist");
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        name,
        age,
        email,
        password: hash,
      });
      let token = jwt.sign({ email: email, userid: user._id }, "hola");
      res.cookie("token", token);
      res.render("new_user");
    });
  });
});

//ask-ai
app.get("/ask_ai", (req, res) => {
  res.render("ask_ai", { result: null });
});

app.post("/ask_ai", async (req, res) => {
  const topic = req.body.topic;
  const tone = req.body.tone; // <-- Add this
  const result = await getAIResponse(topic, tone); // <-- Pass tone too
  res.render("ask_ai", { result });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");
  res.render("profile", { user });
});
app.post("/post", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let { content } = req.body;
  let post = await postModel.create({
    user: user._id,
    content: content,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("Invalid credentials!!");

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "hola");
      res.cookie("token", token);
      return res.status(200).redirect("/profile");
    }
    res.redirect("/login");
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

//protected routes
function isLoggedIn(req, res, next) {
  if (!req.cookies.token || req.cookies.token === "") {
    res.redirect("/login");
  } else {
    let data = jwt.verify(req.cookies.token, "hola");
    //jo humne phele baar data rakha tha voah mil jaeyga,
    // pheli baar data tha email and password, now we are checking that with req.user
    req.user = data;
    next();
  }
}

app.listen(3000);
