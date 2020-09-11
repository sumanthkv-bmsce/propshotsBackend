const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator"); //validtr

const { getUserById } = require("../controllers/user");
const {
  postProperty,
  createOrder,
  photo,
  photo1,
  photo2,
  photo3,
  photo4,
  getProductById,
  getAllProducts,
  getMyProduct,
} = require("../controllers/property");
const { isSignedIn, isAuthenticates } = require("../controllers/auth");
const { updateUser, updateignore } = require("../controllers/auth");

//get user by id
router.param("userId", getUserById); //middleware
router.post(
  "/product/create/:userId",
  [check("PropertyFor", "PropertyFor is requiredd").isLength({ min: 1 })],

  isSignedIn,
  isAuthenticates,
  postProperty
);
// router.post(
//   "/order/:userId/create",

//   isSignedIn,
//   isAuthenticates,
//   createOrder
// );

router.post("/home", isSignedIn);
router.get("/product/photo/:productId", photo);
router.get("/product/photo1/:productId", photo1);
router.get("/product/photo2/:productId", photo2);
router.get("/product/photo3/:productId", photo3);
router.get("/product/photo4/:productId", photo4);
router.param("productId", getProductById);
router.get("/myproducts", getMyProduct);

router.get("/products", getAllProducts);
// router.get("/:productId/properties",)

router.put(
  "/product/:productId/:userId",

  updateUser
);
router.put(
  "/ignore/:productId/:userId",

  updateignore
);

module.exports = router;
