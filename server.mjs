import express from "express";
import { MongoClient } from "mongodb";
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('1234567890', 20);

const mongodbURI = "mongodb+srv://talha1:talha1@cluster0.nxgymft.mongodb.net/?retryWrites=true&w=majority"

const app = express();
app.use(express.json());

let productsCollection;

const connectDB = async () => {
  try {
    const client = new MongoClient(mongodbURI);
    await client.connect();
    const database = client.db('ecom');
    productsCollection = database.collection('products');
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Connect to the database before starting the server
connectDB().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});

app.get('/', (req, res) => {
  res.send('All Products!')
});

app.get("/products", async (req, res) => {
  try {
    const allProducts = await productsCollection.find({}).toArray();
    res.send({
      message: "All products",
      data: allProducts,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error fetching products",
    });
  }
});

app.post("/product", async (req, res) => {
  try {
    const doc = {
      id: nanoid(),
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
    };
    const result = await productsCollection.insertOne(doc);
    res.status(201).send({
      message: "Created product",
      data: doc,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error creating product",
    });
  }
});

app.put("/product/:id", async (req, res) => {
  try {
    const product = await productsCollection.findOne({ id: req.params.id });
    if (!product) {
      res.status(404).send({
        message: "Product not found",
      });
    } else {
      const updatedFields = {};
      if (req.body.name) updatedFields.name = req.body.name;
      if (req.body.price) updatedFields.price = req.body.price;
      if (req.body.description) updatedFields.description = req.body.description;

      await productsCollection.updateOne({ id: req.params.id }, { $set: updatedFields });

      res.send({
        message: "Product is updated with id: " + req.params.id,
        data: { ...product, ...updatedFields },
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error updating product",
    });
  }
});

app.delete("/product/:id", async (req, res) => {
  try {
    const product = await productsCollection.findOne({ id: req.params.id });
    if (!product) {
      res.status(404).send({
        message: "Product not found",
      });
    } else {
      await productsCollection.deleteOne({ id: req.params.id });
      res.send({
        message: "Product is deleted",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error deleting product",
    });
  }
});
