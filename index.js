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
const userCollection = db.collection("users");





    // users API 
     app.post("/users", async(req,res) =>{
      const  newUser =req.body;
      const  email =req.body.email;
      const query = {
        email :email
      }
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
        res.send({message : "user already exits. Do not need insert again"})
      }
        else{
          const result = await userCollection.insertOne(newUser);
        res.send(result);
        }
    })

// find one
 app.get("/bills", async(req,res) =>{
  const cursor = billsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    // insert
app.post("/bills", async(req, res) =>{
    const newBill = req.body;
    const result = await billsCollection.insertOne(newBill);
    res.send(result)
})

// update
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

app.get("/recent-bills", async (req, res) => {
  try {
    const cursor = billsCollection
      .find()
      .sort({ date: -1 }) 
      .limit(6);         
    const result = await cursor.toArray();
    res.send(result);
  } catch (err) {
    console.error(err);
    
  }
});

// get bill by id
app.get('/bills/:id', async (req, res) => {
  const id = req.params.id;
    const bill = await billsCollection.findOne({ _id: new ObjectId(id) });
    res.send(bill);
  
  
});



// delete
app.delete('/bills/:id', async(req, res)=>{
  const id = req.params.id;
  const query = { _id: new ObjectId(id)}
  const result = await billsCollection.deleteOne(query);
    res.send(result)
})
 
// payment
// Get bills of a specific user
app.get("/payments", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).send({ message: "Email is required" });

    const cursor = billsCollection.find({ email });
    const result = await cursor.toArray();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to fetch user bills" });
  }
});


// insert
app.post("/payments", async (req, res) => {
  try {
    const newBill = req.body; // email, billId, amount, title, category, username, address, phone, date
    const result = await billsCollection.insertOne(newBill);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to insert bill" });
  }
});

// delete
app.delete("/payments/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await billsCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to delete bill" });
  }
});

// update
app.patch("/payments/:id", async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;

  try {
    const query = { _id: new ObjectId(id) };
    const update = { $set: updateData };
    const result = await billsCollection.updateOne(query, update);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to update bill" });
  }
});


// PUT /payments/:id - update a payment
app.put('/payments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    const result = await paymentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: {
          amount: updateData.amount,
          address: updateData.address,
          phone: updateData.phone,
          date: updateData.date
      }}
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "Payment not found" });
    }

    res.send({ message: "Payment updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to update payment" });
  }
});





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
