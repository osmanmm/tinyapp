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
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
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
    user: users[req.cookies.user_id],
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
    res.cookie("username" , users[id]);
    res.redirect("/urls");
  });  
  app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/urls");
  });
  app.post("/register", (req, res) => {
    const { email, password } = req.body;
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: email,
      password: password
      
    };
    console.log(users)
    res.cookie("user_id" , newUserID);
    res.redirect('/urls') 
  });
  app.get("/register", (req,res) => {
    let templateVars = {
      user: users[req.cookies["user_id"]]
    };
      res.render("urls_register", templateVars);
  });
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
