const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
function generateRandomString() {
return Math.random().toString(36).substr(2 , 6);
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
    username: req.cookies["username"]
   };
  
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});
app.post("/urls" , (req , res) => {
  const shortURL = generateRandomString();
 urlDatabase[generateRandomString()] = req.body.longURL;
res.redirect("/urls");
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
app.get("/u/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);

});
app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = req.body.newURL;
    //res.redirect(`/urls/${shortURL}`);
    res.redirect('/urls');
  });
  app.post("/login", (req, res) => {
    const username = req.body.username;
    res.cookie("username" , username);
    res.redirect("/urls");
  });  
  app.post("/logout", (req, res) => {
    res.clearCookie("username");
    res.redirect("/urls");
  });
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
