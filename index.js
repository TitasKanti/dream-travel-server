const express = require('express');
const { MongoClient } = require("mongodb");
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

//Connecting to the database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d9ivi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const eventCollection = client.db("Tourism").collection("events");
    const orderCollection = client.db("Users").collection("orders");

    //GET API
    app.get('/travel', async (req, res) => {
        const cursor = eventCollection.find({});
        const events = await cursor.toArray();
        res.send(events);
    })

    //POST API to create new event
    app.post('/addEvent', async (req, res) => {
        const newEvent = req.body;
        const addEvent = await eventCollection.insertOne(newEvent);
        res.send(addEvent);
    })

    //POST API: Getting data from client side and sending to mongodb
    app.post('/orders', async (req, res) => {
        const newOrder = req.body;
        const result = await orderCollection.insertOne(newOrder);
        res.send(result);
    })

    //GET API from orderCollection
    app.get('/orders', async (req, res) => {
        const cursor = orderCollection.find({});
        const orders = await cursor.toArray();
        res.send(orders);
    })

    //GET SPECIFIC API from orderCollection
    app.get('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await orderCollection.findOne(query);
        console.log('load user with id', id);
        res.send(result);
    })

    //UPDATE API
    app.put('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const updatedOrder = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                status: updatedOrder.status
            }
        };
        const result = await orderCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    })

    //DELETE API
    app.delete('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await orderCollection.deleteOne(query);
        console.log('deleting user with id', result);
        res.send(result);
    })

});

app.get('/', (req, res) => {
    res.send('running the server')
});

app.listen(port, () => {
    console.log('running server from port', port);
})

