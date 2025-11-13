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

    // await client.connect();

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


// 

app.post('/users', async (req, res) => {
      const user = req.body;

      if (!user?.email) {
        return res.status(400).send({ success: false, message: "Email is required!" });
      }

      try {
        // user already exists
        const existingUser = await userCollection.findOne({ email: user.email });
        if (existingUser) {
          return res.send({ success: true, message: "User already exists!", user: existingUser });
        }

        // Insert new user
        const result = await userCollection.insertOne({
          name: user.name,
          email: user.email,
          image: user.image || "",
          createdAt: new Date(),
        });

        res.send({ success: true, message: "User added successfully!", result });
      } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send({ success: false, message: "Server error while saving user." });
      }
    });

    //all user
    app.get('/users', async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });


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

app.get("/add-bills", async (req, res) => {
  try {
    const cursor = billsCollection
      .find()
      .limit(8);         
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


app.get("/my-bills", async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).send({ message: "Email is required" });
  }
  const query = { email };
  const bills = await billsCollection.find(query).toArray();


  const totalBillPaid = bills.length;
  const totalAmount = bills.reduce(
    (sum, bill) => sum + (parseFloat(bill.amount) || 0),
    0
  );

  res.send({
    totalBillPaid,
    totalAmount,
    bills,
  });
});


app.patch("/bills/:id", async (req, res) => {
  const id = req.params.id;
  const updateBill = req.body;
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      amount: updateBill.amount,
      address: updateBill.address,
      phone: updateBill.phone,
      date: updateBill.date,
    },
  };
  const result = await billsCollection.updateOne(query, updateDoc);
  res.send(result);
});

 
    // await client.db("admin").command({ ping: 1 });
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
