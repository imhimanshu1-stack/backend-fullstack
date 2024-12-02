const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb://localhost:27017";

const dbName = "ecom";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = client.db(dbName);

exports.register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password is required" });
  }

  try {
    const user = await db.collection("users").findOne({ email });
    if (user) {
      return res.status(400).json({ message: "email id already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db
      .collection("users")
      .insertOne({ email, password: hashedPassword });
    res.status(201).json({
      message: "User registered successfully.",
      userId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(200).json({ message: "user not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "password is not correct" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ message: "login was successful", token: token });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "feilds are not provided" });
    }
    const user = await db.collection("users").findOne({ email });
    await db
      .collection("users")
      .updateOne(
        { userId: new ObjectId(user._id) },
        { $set: { password: await bcrypt.hash(password, 10) } }
      );
    return res.status(200).json({ message: "password changed sucessfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user;
    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "User ID, product ID, and quantity are required." });
    }
    const userCart = await db
      .collection("carts")
      .findOne({ userId: new ObjectId(userId) });
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });

    if (product.stock <= 0) {
      return res
        .status(200)
        .json({ message: "there is not stock for this product" });
    }
    if (userCart) {
      const existingItemIndex = userCart.items.findIndex(
        (item) => item.productId === productId
      );

      await db
        .collection("products")
        .updateOne(
          { _id: new ObjectId(productId) },
          { $set: { stock: product.stock - parseFloat(quantity) } }
        );
      if (existingItemIndex > -1) {
        userCart.items[existingItemIndex].quantity += quantity;
      } else {
        userCart.items.push({
          userId: userId,
          productId,
          name: product.name,
          price: product.price,
          quantity,
        });
      }
      await db
        .collection("carts")
        .updateOne(
          { userId: new ObjectId(userId) },
          { $set: { items: userCart.items } }
        );
    } else {
      const newCart = {
        userId: new ObjectId(userId),
        items: [
          {
            productId,
            name: product.name,
            price: product.price,
            quantity,
          },
        ],
      };
      console.log(newCart);
      await db.collection("carts").insertOne(newCart);
    }
    return res.status(200).json({ message: "product added to cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.viewAddToCart = async (req, res) => {
  try {
    const userId = req.user;
    const cart = await db
      .collection("carts")
      .findOne({ userId: new ObjectId(userId) });
    return res.status(200).json({ Data: cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user;
    const { productId } = req.body;
    const userCart = await db
      .collection("carts")
      .findOne({ userId: new ObjectId(userId) });
    if (userCart) {
      const productIndex = userCart.items.findIndex(
        (item) => item.productId === productId
      );
      if (productIndex !== -1) {
        console.log(userCart.items);
        const product = await db
          .collection("products")
          .findOne({ _id: new ObjectId(productId) });
        await db
          .collection("products")
          .updateOne(
            { _id: new ObjectId(productId) },
            {
              $set: {
                stock: product.stock + userCart.items[productIndex].quantity,
              },
            }
          );
        userCart.items.splice(productIndex, 1);

        await db
          .collection("carts")
          .updateOne(
            { userId: new ObjectId(userId) },
            { $set: { items: userCart.items } }
          );
        return res
          .status(201)
          .json({ message: "updated the cart sucessfully" });
      }
      return res
        .status(404)
        .json({ message: "no cart assosiated with this id" });
    } else {
      console.log("Product not found in the cart");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
