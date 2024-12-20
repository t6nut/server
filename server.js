const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors({
	origin: 'http://localhost:3000', // Allow requests from this origin
}));
app.use(express.json());

// Sample data
let influencers = [
	{
		id: 1,
		firstName: 'John',
		lastName: 'Doe',
		socialMediaAccounts: [
			{ platform: 'instagram', username: 'john_doe' },
			{ platform: 'tiktok', username: 'johndoe123' },
		],
		manager: null, // No manager initially
	},
];
let managers = [
	{ id: 1, name: 'Manager 1' },
	{ id: 2, name: 'Manager 2' },
];

app.post('/influencers', (req, res) => {
	const newInfluencer = req.body;

	// Validation
	if (!newInfluencer.firstName || !newInfluencer.lastName) {
		return res.status(400).json({ error: 'First name and last name are required.' });
	}

	if (newInfluencer.firstName.length > 50 || newInfluencer.lastName.length > 50) {
		return res.status(400).json({ error: 'First and last names must be 50 characters or less.' });
	}

	if (!Array.isArray(newInfluencer.socialMediaAccounts) || !newInfluencer.socialMediaAccounts.every(account => account.platform && account.username)) {
		return res.status(400).json({ error: 'Valid social media accounts are required.' });
	}

	const uniqueAccounts = new Set();
	for (const account of newInfluencer.socialMediaAccounts) {
		const accountString = `${account.platform}-${account.username.toLowerCase()}`;
		if (uniqueAccounts.has(accountString)) {
			return res.status(400).json({ error: 'Duplicate social media accounts are not allowed.' });
		}
		uniqueAccounts.add(accountString);
	}

	newInfluencer.socialMediaAccounts = Array.from(uniqueAccounts).map(accountStr => {
		const [platform, username] = accountStr.split('-');
		return { platform, username };
	});

	// Assign ID
	newInfluencer.id = influencers.length + 1;

	influencers.push(newInfluencer);
	res.status(201).json(newInfluencer); // Respond with the newly created influencer
});


// GET /influencers (Fetch influencers list)
app.get('/influencers', (req, res) => {
	res.json(influencers);
});

// GET /managers (Fetch managers list)
app.get('/managers', (req, res) => {
	res.json(managers); // Use the globally defined managers array
});

// PATCH /influencers/:id/manager (Assign or remove a manager)
app.patch('/influencers/:id/manager', (req, res) => {
	const influencerId = parseInt(req.params.id, 10);
	const { managerId } = req.body;

	// Find the influencer by ID
	const influencer = influencers.find((inf) => inf.id === influencerId);
	if (!influencer) {
		return res.status(404).json({ error: 'Influencer not found.' });
	}

	// If managerId is null, remove the manager
	if (managerId === null) {
		influencer.manager = null;
	} else {
		// Find the manager by ID
		const manager = managers.find((emp) => emp.id === managerId);
		if (!manager) {
			return res.status(404).json({ error: 'Manager not found.' });
		}
		// Assign the manager
		influencer.manager = { id: manager.id, name: manager.name };
	}

	res.json(influencer); // Return updated influencer
});

// 404 handler for unmatched routes
app.use((req, res) => {
	res.status(404).json({ error: 'Not Found' });
});

// General error handler for unexpected issues
app.use((err, req, res, next) => {
	console.error('Unhandled Server Error:', err);
	res.status(500).json({ error: 'An unexpected server error occurred.' });
});

// Start the server
app.listen(port, () => console.log(`Server listening on port ${port}`));
