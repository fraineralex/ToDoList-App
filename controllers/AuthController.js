const User = require("../models/User");
const Records = require("../models/Records");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { Op } = require("sequelize");
const moment = require("moment");

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

  const user = await User.findOne({
    where: {
      [Op.and]: [
        { username: username },
        {
          [Op.or]: [
            { userExpiration: null },
            { userExpiration: { [Op.gt]: Date.now() } },
          ],
        },
      ],
    },
  });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.password);

  if (!(user && passwordCorrect)) {
    req.flash("errors", "Invalid user or password");
    return res.redirect("/");
  } else {
    const userType = user.userExpiration === null ? "Permanent" : "Temporal";
    Records.create({
      action: "Sing in",
      fullName: user.fullName,
      username: user.username,
      userType: userType,
      actionDate: moment().format("LLLL"),
      userId: user.id,
    })
      .then(() => {
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
              Records.create({
                action: "Sing up",
                fullName: user.fullName,
                username: user.username,
                userType: "Permanent",
                actionDate: moment().format("LLLL"),
                userId: user.id,
              })
                .then(() => {
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
        .hash("default123", 12)
        .then((hashedPassword) => {
          User.create({
            fullName: newUser.name,
            username: newUser.username,
            password: hashedPassword,
            userExpiration: Date.now() + 1800000,
          })
            .then((createdUser) => {
              Records.create({
                action: "Sing up and Sing in",
                fullName: createdUser.fullName,
                username: createdUser.username,
                userType: "Temporal",
                actionDate: moment().format("LLLL"),
                userId: createdUser.id,
              })
                .then(() => {
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
        .catch((err) => {
          console.log(err);
        });
    })
    .catch(function (error) {
      console.error(error);
    });
};

exports.PostMakePermanentUser = (req, res, next) => {
  const userId = req.body.UserId;

  User.update({ userExpiration: null }, { where: { id: userId } })
    .then(() => {
      res.redirect("/user-information");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.PostUpdateTemporalProfile = (req, res, next) => {
  const fullName = req.body.FullName;
  const username = req.body.Username;
  const password = req.body.Password;
  const confirmPassword = req.body.ConfirmPassword;
  const userId = req.body.UserId;

  if (password != confirmPassword) {
    req.flash("errors", "Password and confirm password no equals");
    return res.redirect("/user-information");
  }

  User.findOne({ where: { username: username } })
    .then((user) => {
      if (user) {
        req.flash(
          "errors",
          "username exits already, please pick a different one"
        );
        return res.redirect("/user-information");
      }
    })
    .catch((err) => {
      console.log(err);
    });
  if (username && fullName && password) {
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        User.update(
          {
            fullName: fullName,
            username: username,
            password: hashedPassword,
          },
          { where: { id: userId } }
        )
          .then((user) => {
            res.redirect("/user-information");
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (username && fullName) {
    User.update(
      {
        fullName: fullName,
        username: username,
      },
      { where: { id: userId } }
    )
      .then((user) => {
        res.redirect("/user-information");
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (username && password) {
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        User.update(
          {
            username: username,
            password: hashedPassword,
          },
          { where: { id: userId } }
        )
          .then((user) => {
            res.redirect("/user-information");
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (fullName && password) {
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        User.update(
          {
            fullName: fullName,
            password: hashedPassword,
          },
          { where: { id: userId } }
        )
          .then((user) => {
            res.redirect("/user-information");
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (username) {
    User.update(
      {
        username: username,
      },
      { where: { id: userId } }
    )
      .then((user) => {
        res.redirect("/user-information");
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (fullName) {
    User.update(
      {
        fullName: fullName,
      },
      { where: { id: userId } }
    )
      .then((user) => {
        res.redirect("/user-information");
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (password) {
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        User.update(
          {
            password: hashedPassword,
          },
          { where: { id: userId } }
        )
          .then((user) => {
            res.redirect("/user-information");
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    req.flash("errors", "An error has occurred, please try again");
    return res.redirect("/user-information");
  }
};

exports.PostUpdatePermanentProfile = async (req, res, next) => {
  const fullName = req.body.FullName;
  const username = req.body.Username;
  const currentlyPassword = req.body.CurrentlyPassword;
  const password = req.body.Password;
  const confirmPassword = req.body.ConfirmPassword;
  const userId = req.body.UserId;

  if (!currentlyPassword) {
    req.flash("errors", "You must insert your current password");
    return res.redirect("/user-information");
  }

  if (username) {
    User.findOne({ where: { username: username } })
      .then((user) => {
        if (user) {
          req.flash(
            "errors",
            "username exits already, please pick a different one"
          );
          return res.redirect("/user-information");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  if (password != confirmPassword) {
    req.flash("errors", "Password and confirm password no equals");
    return res.redirect("/user-information");
  }

  const user = await User.findOne({ where: { id: userId } });
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(currentlyPassword, user.password);

  if (!(user && passwordCorrect)) {
    req.flash("errors", "Invalid password, try again");
    return res.redirect("/user-information");
  }

  if (fullName && password && username) {
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        User.update(
          {
            fullName: fullName,
            username: username,
            password: hashedPassword,
          },
          { where: { id: userId } }
        )
          .then((user) => {
            res.redirect("/user-information");
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (fullName && username) {
    User.update(
      {
        username: username,
        fullName: fullName,
      },
      { where: { id: userId } }
    )
      .then((user) => {
        res.redirect("/user-information");
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (fullName && password) {
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        User.update(
          {
            fullName: fullName,
            password: hashedPassword,
          },
          { where: { id: userId } }
        )
          .then((user) => {
            res.redirect("/user-information");
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (password && username) {
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        User.update(
          {
            username: username,
            password: hashedPassword,
          },
          { where: { id: userId } }
        )
          .then((user) => {
            res.redirect("/user-information");
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (fullName) {
    User.update(
      {
        fullName: fullName,
      },
      { where: { id: userId } }
    )
      .then((user) => {
        res.redirect("/user-information");
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (username) {
    User.update(
      {
        username: username,
      },
      { where: { id: userId } }
    )
      .then((user) => {
        res.redirect("/user-information");
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (password) {
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        User.update(
          {
            password: hashedPassword,
          },
          { where: { id: userId } }
        )
          .then((user) => {
            res.redirect("/user-information");
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    req.flash("errors", "An error has occurred, please try again");
    return res.redirect("/user-information");
  }
};
