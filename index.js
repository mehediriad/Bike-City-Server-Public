const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xbubr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//Main Function
async function run(){
    try{
        await client.connect();
        console.log('BikeCity! Database Connected.');
        const database = client.db('bikeCityDB');
        const bikesCollection = database.collection('bikes');
        const usersCollection = database.collection('users');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');


        // GET API for bikes
        app.get('/bikes', async (req, res) => {
            const cursor = bikesCollection.find({});
            const bikes = await cursor.toArray();
            res.send(bikes);
        });

          // GET Single Bikes with ID
          app.get('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const bike = await bikesCollection.findOne(query);
           console.log(bike)
            res.send(bike);
        })

        // POST API For bikes
        app.post('/bikes', async (req, res) => {
            const newItem = req.body;
            const result = await bikesCollection.insertOne(newItem);
            console.log('Get new user', req.body);
            console.log('Added user', result);
            res.json(result);
        });

         // DELETE API for Bikes
         app.delete('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bikesCollection.deleteOne(query);

            console.log('deleting item with id ', result);

            res.json(result);
        })
        // Post APi for users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
        // Put api for google singed in user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // PUT API for Make Admin Role
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        //GET ADMIN Role API
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        
        // Add Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })

        // Add Orders API Filter with email
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
           
            const query = {email : email};
           
            const cursor = await ordersCollection.find(query);
            const myOrders = await cursor.toArray();
            res.json(myOrders)
        })

         // GET Order API
         app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

         // GET Single Order with ID
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const order = await ordersCollection.findOne(query);
           
            res.send(order);
        })

          // DELETE API Order
          app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);

            console.log('deleting item with id ', result);

            res.json(result);
        })
         //Post Review API
         app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        })

         // GET Review API
         app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

    }
    finally{
         // await client.close();
    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Running my BikeCity! Server...');
});

app.listen(port, () => {
    console.log('Running BikeCity! Server on port', port);
})