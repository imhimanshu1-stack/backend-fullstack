const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb://localhost:27017";

const dbName = "ecom";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = client.db(dbName);

exports.createProduct = async (req, res) => {
  try {
    const { price, name, stock, location } = req.body;
    const path = req.file.path;

    const product = db.collection("products").insertOne({
      price: parseFloat(price),
      name,
      stock: parseFloat(stock),
      location,
      photo: path,
    });
    res
      .status(201)
      .json({ message: "Product created successfully.", Data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const products = await db.collection("products").find({}).toArray();

    res.status(200).json({ products });
  } catch (err) {
    console.error("Error listing products:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const userId = req.user;
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    const cart = await db
      .collection("carts")
      .findOne({ userId: new ObjectId(userId) });
    if (!cart) {
      return res.status(500).json({ message: "cart is empty" });
    }
    if (!cart.items[0]) {
      return res.status(500).json({ message: "cart is empty" });
    }
    await db.collection("orders").insertOne({
      name: name,
      phone: phone,
      items: cart.items,
      userId: new ObjectId(userId),
      email: user.email,
    });
    await db
      .collection("carts")
      .findOneAndDelete({ userId: new ObjectId(userId) });
    return res.status(200).json({ message: "order place succesfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
