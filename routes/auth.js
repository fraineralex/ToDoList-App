const express = require("express");

const authController = require("../controllers/AuthController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", authController.GetLogin);
router.post("/login", authController.PostLogin);
router.get("/logout", isAuth, authController.Logout);
router.get("/signup", authController.GetSignup);
router.post("/signup", authController.PostSignup);

module.exports = router;
