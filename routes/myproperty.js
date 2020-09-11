const express = require("express");
const router = express.Router();

const { getUserById } = require("../controllers/user");
const { MyProperty } = require("../controllers/myproperty");

router.param("userId", getUserById);
router.get("/user/:userId/myproperty", MyProperty);

module.exports = router;
