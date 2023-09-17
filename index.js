const express = require('express');
const cors = require('cors');
const excel = require('exceljs');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// ! Required variables
const app = express();
const port = 5000;
// ? TODO: Create MONGODB_URI in the local variable file
const uri = process.env.MONGODB_URI;

// ! Middlewares
app.use(express.json());
app.use(cors());

// Create a MongoClient
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

function run() {
	try {
		// Connect the client to the server
		client.connect();
		const db = client.db('contactPilot');

		// ! Database collections
		const usersCollection = db.collection('users');
		const contactsCollection = db.collection('contacts');

		app.get('/', (req, res) => {
			res.send('Welcome to Contact Pilot api!');
		});

		// * Users related API's
		app.get('/api/users', async (req, res) => {
			const result = await usersCollection.findOne({
				email: req.query.email,
				password: req.query.password,
			});

			res.send(result);
		});

		app.post('/api/users', async (req, res) => {
			const userData = req.body;
			const email = userData.email;

			const result = await usersCollection.updateOne(
				{ email },
				{ $set: userData },
				{ upsert: true }
			);

			res.send(result);
		});

		// * Contacts related API's
		app.get('/api/contacts', async (req, res) => {
			const result = await contactsCollection
				.find({ userEmail: req.query.email })
				.toArray();
			res.send(result);
		});

		app.get('/api/contacts/10', async (req, res) => {
			const result = await contactsCollection
				.find({ userEmail: req.query.email })
				.sort({ _id: -1 })
				.limit(10)
				.toArray();

			res.send(result);
		});

		app.get('/api/contacts/name', async (req, res) => {
			const result = await contactsCollection
				.find({ userEmail: req.query.email })
				.sort({ name: 1 })
				.toArray();

			res.send(result);
		});

		app.get('/api/contacts/date', async (req, res) => {
			const result = await contactsCollection
				.find({ userEmail: req.query.email })
				.sort({ _id: -1 })
				.toArray();

			res.send(result);
		});

		app.get('/api/contacts/email', async (req, res) => {
			const result = await contactsCollection
				.find({ userEmail: req.query.email })
				.sort({ email: 1 })
				.toArray();

			res.send(result);
		});

		app.get('/api/contacts/download', async (req, res) => {
			const userEmail = req.query.email;

			// const user = await usersCollection.findOne({ email: userEmail });
			const contacts = await contactsCollection
				.find({
					userEmail: userEmail,
				})
				.toArray();

			const workbook = new excel.Workbook();
			const worksheet = workbook.addWorksheet('Contacts Data');

			worksheet.columns = [
				{ header: 'Name', key: 'name', width: 25 },
				{ header: 'Phone', key: 'phone', width: 25 },
				{ header: 'Email', key: 'email', width: 40 },
			];

			contacts.forEach((contact) => {
				worksheet.addRow({
					name: contact.name,
					phone: contact.phone,
					email: contact.email,
				});
			});

			res.setHeader(
				'Content-Type',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			);
			res.setHeader(
				'Content-Disposition',
				'attachment; filename=' + 'contacts_data.xlsx'
			);

			return workbook.xlsx.write(res).then(() => {
				res.status(200).end();
			});
		});

		app.get('/api/contacts/contact', async (req, res) => {
			const result = await contactsCollection.findOne({
				name: req.query.name,
			});
			res.send(result);
		});

		app.get('/api/contacts/:id', async (req, res) => {
			const _id = new ObjectId(req.params.id);

			const result = await contactsCollection.findOne({ _id });
			res.send(result);
		});

		app.post('/api/contacts', async (req, res) => {
			const contactsData = req.body;

			const result = await contactsCollection.insertOne(contactsData);
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
	} catch (error) {
		console.log(`Error: ${error}`);
		res.status(500).send('Internal Server Error');
	}
}
run();

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
