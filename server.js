const path = require("path");
const express = require("express");
const jwt = require("jsonwebtoken");
const exjwt = require("express-jwt");

const app = express();

const secretKey = "secretKey";

const PORT = process.env.PORT || 3000;

const jwtMW = exjwt({
  secret: secretKey,
  algorithms: ["HS256"],
});

const users = [
  {
    id: 1,
    username: "connor",
    password: "123",
  },
  {
    id: 2,
    username: "love",
    password: "456",
  },
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", `http://localhost:${PORT}`);
  res.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  for (const user of users) {
    if (user.username === username && user.password === password) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        secretKey,
        {
          expiresIn: "7d",
        }
      );
      res.json({
        success: true,
        err: null,
        token,
      });
      return;
    }
  }

  res.status(401).json({
    success: false,
    token: null,
    err: "Username or password is incorrect",
  });
});

app.get("/api/dashboard", jwtMW, (req, res) => {
  res.json({
    success: true,
    content: "content",
  });
});

app.get("/api/settings", jwtMW, (req, res) => {
  res.json({
    success: true,
    content: "here are some settings",
  });
});

app.get(["/", "/settings", "/dashboard"], (req, res) => {
  return res.sendFile(path.join(__dirname, "index.html"));
});

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({
      success: false,
      err,
    });
  } else {
    next(err);
  }
});

app.listen(3000, () => {
  console.log(`app listening on localhost:${PORT}`);
});
