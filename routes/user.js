const { register } = require("../controllers/users");

const router = require("express").Router();
router.post("/register", register);

module.exports = router;
