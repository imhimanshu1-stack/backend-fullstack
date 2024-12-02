const { createProduct, findAll } = require("../controllers/products");
const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

const router = require("express").Router();
const authUser = require("../middleware/user");

router.post(
  "/create-products",
  upload.single("photo"),
  authUser,
  createProduct
);

router.get("/fetch-all-products", authUser, findAll);

module.exports = router;
