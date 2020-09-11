var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator"); //validtr

const {
  signup,
  signupcheck,
  signincheck,
  signin,
  signout,
  updateUser,
  getalldata,
} = require("../controllers/auth");
router.post(
  "/signup",
  [
    check("phone", "Phone number is required").isMobilePhone(),
    check("phone", "Mobile number should be 10 digits").isLength({
      min: 10,
      max: 10,
    }),
    check("email", "Email is required").isEmail(), //validaters
    check("name", "Name should at least contain 2 characters").isLength({
      min: 2,
      max: 30,
    }), //validaters
  ],
  signup
);
router.post(
  "/signupcheck",
  [
    check("phone", "Mobile number is required").isMobilePhone(),
    check("phone", "Mobile number should be 10 digits").isLength({
      min: 10,
      max: 10,
    }),
    check("email", "Email is required").isEmail(), //validaters
    check("name", "Name should at least contain 2 characters").isLength({
      min: 2,
    }), //validaters
  ],
  signupcheck
);

router.post(
  "/signin",
  [
    check("phone", "Mobile number is required").isMobilePhone(), //validaters
  ],
  signin
);
router.post(
  "/signincheck",
  [
    check("phone", "Mobile number is required").isMobilePhone(), //validaters
  ],
  signincheck
);

router.get("/home", getalldata);
router.get("/signout", signout);

module.exports = router;
