const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// middleware
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://billdbUser:PiUBHJqz1lQhsWgr@cluster0.6mz34iu.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();

    const db = client.db("bill_db");
const billsCollection = db.collection("bills");

app.post("/bills", async(req, res) =>{
    const newBill = req.body;
    const result = await billsCollection.insertOne(newBill);
    res.send(result)
})


app.patch('/bills/:id', async(req, res)=>{
  const id = req.params.id;
 const updateBill =req.body;
  const query = { _id: new ObjectId(id)}
  const update =
  {
    $set:{
      name: updateBill.name,
      price: updateBill.price
    }
  }
 
  const result = await billsCollection.updateOne(query,update);
    res.send(result)
})


app.delete('/bills/:id', async(req, res)=>{
  const id = req.params.id;
  const query = { _id: new ObjectId(id)}
  const result = await billsCollection.deleteOne(query);
    res.send(result)
})



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
   
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Billing system server is running ')
});


app.listen(port, () => {
  console.log(`Billing system server is running on port ${port}`)
})
