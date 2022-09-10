/* This is a middleware function that checks if the user is logged in. If not, it redirects them to the
home page and display the message: "Your session has expired, you must log in again"  */
module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
     req.flash("errors", "Your session has expired, you must log in again");
    return res.redirect("/home");
  }

  next();
};
