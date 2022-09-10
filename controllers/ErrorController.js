/* This is a function that is exported to the app.js file. It is a function that is called when the
user tries to access a page that does not exist. */
exports.Get404 = (req,res,next) =>{
    res.status(404).render("404",{pageTitle: "Not found"});
}