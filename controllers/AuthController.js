const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.GetLogin = (req, res, next) => {

  res.render("auth/login", {
    pageTitle: "Login",
    logOut: true,   
  });
};

exports.PostLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        req.flash("errors", "email is invalid ");
        return res.redirect("/");
      }

      bcrypt
        .compare(password, user.password)
        .then((result) => {
          if (result) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/home");
            });
          }
          req.flash("errors", "password is invalid");
          res.redirect("/");
        })
        .catch((err) => {
          console.log(err);
           req.flash("errors", "An error has occurred contact the administrator.");
          res.redirect("/");
        });
    })
    .catch((err) => {
      console.log(err);
          req.flash(
            "errors",
            "An error has occurred contact the administrator."
          );
      res.redirect("/");
    });
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
  });
};

exports.PostSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if(password != confirmPassword){
       req.flash(
          "errors",
          "Password and confirm password no equals"
        );
        return res.redirect("/signup");
  }

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (user) {
        req.flash(
          "errors",
          "email exits already, please pick a different one "
        );
        return res.redirect("/signup");
      }

      bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          User.create({name: name, email: email, password: hashedPassword })
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
