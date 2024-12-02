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
