const express = require("express");

const authController = require("../controllers/AuthController");

const router = express.Router();

router.get("/", authController.GetLogin);
router.post("/login", authController.PostLogin);
router.get("/logout", authController.Logout);
router.get("/signup", authController.GetSignup);
router.post("/signup", authController.PostSignup);

//Temporal user
router.post("/new-temporal-user", authController.PostTemporalUser);

module.exports = router;
