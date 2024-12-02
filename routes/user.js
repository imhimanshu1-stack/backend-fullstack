const {
  register,
  login,
  forgetPassword,
  addToCart,
  viewAddToCart,
} = require("../controllers/users");
const authUser = require("../middleware/user");

const router = require("express").Router();
router.post("/register", register);
router.post("/login", login);
router.put("/forgot-password", forgetPassword);
router.post("/add-to-cart", authUser, addToCart);
router.get("/view-cart", authUser, viewAddToCart);

module.exports = router;
