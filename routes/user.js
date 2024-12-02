const { register, login, forgetPassword } = require("../controllers/users");

const router = require("express").Router();
router.post("/register", register);
router.post("/login", login);
router.put("/forgot-password", forgetPassword);

module.exports = router;
