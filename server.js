const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const uri =
  "mongodb+srv://himanshu:4mkq9kPh6glSgmXp@cluster0b.inbjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0bmodobdb";
require("dotenv").config({ path: "./config/config.env" });
const users = require("./routes/user");
const products = require("./routes/product");
const path = require("path");
const cors = require("cors");
const dbName = "ecom";
const port = process.env.PORT || 3000;
app.use(
  cors({
    origin: "*",
    methods: ["POST", "PUT", "DELETE", "PATCH", "GET"],
    credentials: true,
  })
);
app.get("/", (req, res) => res.send("Hello World!"));

app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1", users);
app.use("/api/v1", products);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    const collection = db.collection("ecom");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

connectToDatabase();

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
