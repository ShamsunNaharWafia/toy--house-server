const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.na3b9ip.mongodb.net/?retryWrites=true&w=majority`;

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

    const db = client.db("toyHouse");
    const toysCollection = db.collection("category");
    // const tabsCollection = data.collection("Tabs");

    //const indexKeys = { toyName: 1 }; // Replace field1 and field2 with your actual field names
    //const indexOptions = { name: "Toyname" }; // Replace index_name with the desired index name
    //const result = await toysCollection.createIndex(indexKeys, indexOptions);
    //console.log(result);

    //getting all toy data
    app.get("/alltoys", async (req, res) => {
      const result = await toysCollection
        .find({})
        .limit(20)
        // .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });


    app.get("/tabtoys/:text", async (req, res) => {
      //console.log(req.params.text);
      if (
        req.params.text == "wooden" ||
        req.params.text == "plastic" ||
        req.params.text == "plush"
      ) {
        const result = await toysCollection
          .find({
            category: req.params.text,
          })
          .limit(20)
          .toArray();
        //console.log(result);
        return res.send(result);
      }
      const result = await toysCollection.find({}).toArray();
      res.send(result);
    });

    //search by toy name
    app.get("/getToys/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toysCollection
        .find({
          $or: [{ toyName: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    //view details
    app.get("/alltoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const toys = await toysCollection.findOne(query);
      res.send(toys);
    });

    //grtting my toys
    app.get("/mytoys/:email", async (req, res) => {
      //console.log(req.params.id);
      const result = await toysCollection
        .find({
          email: req.params.email,
        })
        // .sort({ price: 1 })
        // .collation({ local: "en_US", numericOrdering: true})
        .toArray();
      res.send(result);
    });

    app.post("/postToy", async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      console.log(body);
      const result = await toysCollection.insertOne(body);
      console.log(result);
      res.send(result);
    });

    //delete my toy
    app.delete("/mytoys/:id", async (req, res) => {
      //console.log(req.params.id);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    //update my toy
    app.get("/mytoy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const toy = await toysCollection.findOne(query);
      res.send(toy);
    });

    app.put("/mytoy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          toyName: body.toyName,
          price: body.price,
          quantity: body.quantity,
          detail: body.detail
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
  res.send("toy house is running");
});

app.listen(port, () => {
  console.log(`toy house Server is running on port ${port}`);
});
