
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const {
  getUserByEmail,
  generateRandomString,
  getUrlsForUser,
} = require("./helpers");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['e1d50c4f-538a-4682-89f4-c002f10a59c8', '2d310699-67d3-4b26-a3a4-1dbf2b67be5c'],
  })
);

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};

//users Database
const users = {};

//homepage
app.get("/", (req, res) => {
  res.send('<h3>Hello!</h3>');
});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = getUserByEmail(email, users);
  const id = generateRandomString();

  if (!email || !password) {
    return res.status(400).send("Username and Password cannot be blank");
  }
  if (user) {
    return res.status(400).send("User already exisit");
  }

  users[id] = { id, email, hashedPassword };
  req.session.username = id;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.username],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_register", templateVars);
});

//login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("Account does not exist");
  }

  if (!bcrypt.compareSync(password, user.hashedPassword)) {
    return res.status(400).send("Incorrect Password");
  }

  req.session.username = user.id;
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.username],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_login", templateVars);
});

//logout and clear the session
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  const userID = req.session.username;

  if (!req.session.username) {
    return res.status(400).send("<h3>You are not logged in!</h3>");
  }

  urlDatabase[randomString] = { longURL: req.body.longURL, userID };
  res.redirect(`urls/${randomString}`);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.username],
    urls: getUrlsForUser(req.session.username, urlDatabase),
  };

  if (!req.session.username) {
    return res.status(400).send("<h3>You are not logged in!</h3>");
  }

  res.render("urls_index", templateVars);
  console.log(urlDatabase);
  console.log(urlDatabase);
});

//create a shortURL
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.username] };

  if (!req.session.username) {
    return res.status(400).send("You are not logged in!");
  }

  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.session.username],
    shortURL: req.params.shortURL,
  };

  if (urlDatabase[templateVars.shortURL].userID !== req.session.username) {
    return res.status(400).send("This URL does not belong to you!");
  }

  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = {
      user: users[req.session.username],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
    };

    if (!req.session.username) {
      return res.status(400).send("You are not logged in!");
    }

    if (urlDatabase[templateVars.shortURL].userID !== req.session.username) {
      return res.status(400).send("This URL does not belong to you!");
    }

    res.render("urls_show", templateVars);
  } else {
    res.sendStatus(404);
  }
});

//delete shorURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = {
    user: users[req.session.username],
    shortURL: req.params.shortURL,
  };

  if (urlDatabase[templateVars.shortURL].userID !== req.session.username) {
    return res.status(400).send("This URL does not belong to you!");
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
//listen on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
