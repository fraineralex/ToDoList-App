module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
     req.flash("errors", "Your session has expired, you must log in again");
    return res.redirect("/home");
  }

  next();
};
