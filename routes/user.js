const express = require("express");
const router = express.Router();

const { getUserById, getUser, updateUser } = require("../controllers/user");

const { isSignedIn } = require("../controllers/auth");
//get user by id
router.param("userId", getUserById); //middleware
router.get("/user/:userId", getUser);

//home
// router.post("/home", isSignedIn, isAuthenticates, getUser);

router.get("/home", isSignedIn, (req, res) => {
  res.send("a protected route");
});

module.exports = router;
