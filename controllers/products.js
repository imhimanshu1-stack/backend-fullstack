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
