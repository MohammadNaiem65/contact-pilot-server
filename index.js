const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// ! Required variables
const app = express();
const port = 5000;
const uri = process.env.MONGODB_URI;

// ! Middlewares
app.use(express.json());
app.use(cors());

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
		await client.connect();
		const db = client.db('contactPilot');

		// ! Database collections
		const contactsCollection = db.collection('contacts');
		const usersCollection = db.collection('users');

		app.get('/', (req, res) => {
			res.send('Welcome to Contact Pilot api!');
		});

		// * Users related API's
		app.get('/api/users/:id', async (req, res) => {
			const _id = new ObjectId(req.params.id);

			const result = await usersCollection.findOne({ _id });
			res.send(result);
		});

		app.post('/api/users', async (req, res) => {
			const userData = req.body;

			const result = await usersCollection.insertOne(userData);
			res.send(result);
		});

		// * Contacts related API's
		app.get('/api/contacts', async (req, res) => {
			const result = await contactsCollection
				.find({ userId: req.query.userId })
				.toArray();
			res.send(result);
		});

		app.post('/api/contacts', async (req, res) => {
			const contactsData = req.body;

			const result = await contactsCollection.insertOne(contactsData);
			res.send(result);
		});

		app.get('/api/contacts/:id', async (req, res) => {
			const _id = new ObjectId(req.params.id);

			const result = await contactsCollection.findOne({ _id });
			res.send(result);
		});

		app.put('/api/contacts/:id', async (req, res) => {
			const _id = new ObjectId(req.params.id);
			const updatedContactData = req.body;

			const result = await contactsCollection.replaceOne(
				{ _id },
				updatedContactData
			);
			res.send(result);
		});

		app.delete('/api/contacts/:id', async (req, res) => {
			const _id = new ObjectId(req.params.id);

			const result = await contactsCollection.deleteOne({ _id });
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db('admin').command({ ping: 1 });
		console.log(
			'Pinged your deployment. You successfully connected to MongoDB!'
		);
	} catch (error) {
		console.log(`Error: ${error}`);
	}
}
run().catch(console.dir);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
