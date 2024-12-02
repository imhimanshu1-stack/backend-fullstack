const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const uri = "mongodb://localhost:27017";
require("dotenv").config({ path: "./config/config.env" });
const users = require("./routes/user");

const path = require("path");
const dbName = "ecom";

app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1", users);
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

app.listen(3300, () => {
  console.log("server is running on port 3300");
});
