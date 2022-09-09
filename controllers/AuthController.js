const User = require("../models/User");
const bcrypt = require("bcryptjs");
const axios = require("axios");

exports.GetLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    logOut: true,
    loginCSS: true,
    loginActive: true,
  });
};

exports.PostLogin = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = await User.findOne({ where: { username: username } });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.password);

  if (!(user && passwordCorrect)) {
    req.flash("errors", "Invalid user or password");
    return res.redirect("/");
  } else {
    req.session.isLoggedIn = true;
    req.session.user = user;
    return req.session.save((err) => {
      console.log(err);
      res.redirect("/home");
    });
  }
};

exports.Logout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.GetSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Register",
    logOut: true,
    signupActive: true,
  });
};

exports.PostSignup = (req, res, next) => {
  const fullName = req.body.name;
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (password != confirmPassword) {
    req.flash("errors", "Password and confirm password no equals");
    return res.redirect("/signup");
  }

  User.findOne({ where: { username: username } })
    .then((user) => {
      if (user) {
        req.flash(
          "errors",
          "username exits already, please pick a different one "
        );
        return res.redirect("/signup");
      }

      bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          User.create({
            fullName: fullName,
            username: username,
            password: hashedPassword,
          })
            .then((user) => {
              res.redirect("/");
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.PostTemporalUser = async (req, res, next) => {
  const options = {
    method: "GET",
    url: "https://random-username-generate.p.rapidapi.com/",
    params: {
      locale: "en_US",
      minAge: "18",
      maxAge: "50",
      domain: "ugener.com",
    },
    headers: {
      "X-RapidAPI-Key": "d8bd6b3876mshccddf5cbce5ef61p129618jsncd1082aaa208",
      "X-RapidAPI-Host": "random-username-generate.p.rapidapi.com",
    },
  };

  axios
    .request(options)
    .then(async function (response) {
      const newUser = response.data.items;

      const user = await User.findOne({
        where: { username: newUser.username },
      });
      if (user) {
        req.flash(
          "errors",
          "username exits already, please pick a different one "
        );
        return res.redirect("/signup");
      }
      bcrypt
        .hash(newUser.password, 12)
        .then((hashedPassword) => {
          User.create({
            fullName: newUser.name,
            username: newUser.username,
            password: hashedPassword,
            userExpiration: Date.now() + 1800000
          })
            .then((user) => {
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save((err) => {
                console.log(err);
                res.redirect("/home");
              });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch(function (error) {
      console.error(error);
    });
};
