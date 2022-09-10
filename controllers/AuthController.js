const User = require("../models/User");
const Records = require("../models/Records");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { Op } = require("sequelize");
const moment = require("moment");

/* Rendering the login page. */
exports.GetLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    logOut: true,
    loginCSS: true,
    loginActive: true,
  });
};

/* The above code is a function that is called when the user tries to login. */
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
  /* Checking if the user is null, if it is, it returns false. If it is not null, it will compare the
  hashed password with the user password. */
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.password);

  if (!(user && passwordCorrect)) {
    req.flash("errors", "Invalid user or password");
    return res.redirect("/");
  } else {
    const userType = user.userExpiration === null ? "Permanent" : "Temporal";
    /* Creating a new record in the database. */
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

/* The above code is destroying the session. */
exports.Logout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

/* Rendering the signup page. */
exports.GetSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Register",
    logOut: true,
    signupActive: true,
  });
};

/* The above code is creating a new user and saving it to the database. */
exports.PostSignup = (req, res, next) => {
  const fullName = req.body.name;
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  /* Checking if the password and confirm password are the same. */
  if (password != confirmPassword) {
    req.flash("errors", "Password and confirm password no equals");
    return res.redirect("/signup");
  }

  /* Checking if the username exists in the database. If it does, it will redirect the user to the
  signup page. */
  User.findOne({ where: { username: username } }).then((user) => {
    if (user) {
      req.flash(
        "errors",
        "username exits already, please pick a different one "
      );
      return res.redirect("/signup");
    }

    /* Hashing the password and then returning the hashed password. */
    /* The above code is creating a new user and then creating a new record for that user. */
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
  });
};

/* The above code is creating a temporal user, the user will be deleted after 30 minutes. */
exports.PostTemporalUser = async (req, res, next) => {
  /* The above code is making a GET request to the API endpoint from rapidApi tha provide the temporal users. */
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

      /* Checking if the username exists in the database. */
      const user = await User.findOne({
        where: { username: newUser.username },
      });
      if (user) {
        req.flash(
          "errors",
          "username exits already, please pick a different one "
        );
        return res.redirect("/");
      }
      /* Hashing the password "default123" with a salt of 12. */
      bcrypt
        .hash("default123", 12)
        .then((hashedPassword) => {
          /* Creating a new user and a new record in the database. */
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

/* The above code is updating the userExpiration column in the User table to null fo make permanent this user */
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

/* The above code is updating the personal information of the temporal users. */
exports.PostUpdateTemporalProfile = (req, res, next) => {
  const fullName = req.body.FullName;
  const username = req.body.Username;
  const password = req.body.Password;
  const confirmPassword = req.body.ConfirmPassword;
  const userId = req.body.UserId;

  /* Checking if the password and confirm password are the same. */
  if (password != confirmPassword) {
    req.flash("errors", "Password and confirm password no equals");
    return res.redirect("/user-information");
  }

  /* Checking if the username exists in the database. If it does, it will redirect the user to the
 user-information page. */
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
  /* The above code is updating the user information in the database. */
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

/* The above code is updating the user information of the permanent users. */
exports.PostUpdatePermanentProfile = async (req, res, next) => {
  const fullName = req.body.FullName;
  const username = req.body.Username;
  const currentlyPassword = req.body.CurrentlyPassword;
  const password = req.body.Password;
  const confirmPassword = req.body.ConfirmPassword;
  const userId = req.body.UserId;
  /* Checking if the user has entered their current password. If they have not, it will flash an error
message and redirect them to the user information page. */

  if (!currentlyPassword) {
    req.flash("errors", "You must insert your current password");
    return res.redirect("/user-information");
  }

  if (username) {
    /* Checking if the username exists in the database. If it does, it will redirect the user to the
    user-information page. */
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

  /* Checking if the password and confirm password are the same. */
  if (password != confirmPassword) {
    req.flash("errors", "Password and confirm password no equals");
    return res.redirect("/user-information");
  }

  /* Checking if the user exists and if the password is correct. */
  const user = await User.findOne({ where: { id: userId } });
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(currentlyPassword, user.password);

  /* Checking if the user and password are correct. If they are not correct, it will redirect the user to
the user-information page. */
  if (!(user && passwordCorrect)) {
    req.flash("errors", "Invalid password, try again");
    return res.redirect("/user-information");
  }

  /* The above code is updating the user's information in the database depending of the fields filled by the user. */
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
