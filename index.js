const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER}:${process.env.KEY}@cluster0.a27cvav.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db("emaJohnDB").collection("products");

    app.get("/products", async (req, res) => {
      const page = parseInt(req?.query?.page);
      const limit = parseInt(req?.query?.limit);
      console.log(page, limit);
      const result = await productCollection
        .find()
        .skip(page * limit)
        .limit(limit)
        .toArray();

      res.send(result);
    });

    app.post("/productsbyid", async (req, res) => {
      const ids = req.body;
      const idsWithObj = ids.map((id) => new ObjectId(id));
      const query = {
        _id: {
          $in: idsWithObj,
        },
      };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/productsCount", async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // serch start here
    app.post("/search", async (req, res) => {
      const { query } = req.body;
      if (!req.body) {
        const results = await productCollection.find().toArray();
        return res.json(results);
      }
      const filter = {
        $or: [
          { name: { $regex: query, $options: "i" } }, // Case-insensitive title search
          { author: { $regex: query, $options: "i" } }, // Case-insensitive author search
        ],
      };
      const results = await productCollection.find(filter).toArray();

      res.json(results);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("john is busy shopping");
});

app.listen(port, () => {
  console.log(`ema john server is running on port: ${port}`);
});
