const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors({
	origin: 'http://localhost:3000', // Allow requests from this origin
}));


// Updated influencer data structure
let influencers = []; // Start with an empty array

let employees = [
	{ id: 1, name: 'Employee 1' },
	{ id: 2, name: 'Employee 2' },
];

app.use(express.json());

app.post('/influencers', (req, res) => {
	const newInfluencer = req.body;

	try {
		// ... your existing influencer creation logic ...
	} catch (error) { // Catch ALL errors within the endpoint
		console.error("Error creating influencer:", error); // Log the error on the server
		res.status(500).json({ error: error.message || 'Failed to create influencer.' }); // Send a JSON error response

	}

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
	res.status(201).json(newInfluencer);
});

// GET /influencers with filtering
app.get('/influencers', (req, res) => {
	const filter = req.query.filter || ''; // Get the filter query parameter

	const filteredInfluencers = influencers.filter((influencer) => {
		// Filter by name (case-insensitive)
		const fullName = `${influencer.firstName} ${influencer.lastName}`.toLowerCase();
		return fullName.includes(filter.toLowerCase());
		// Add manager filtering here if needed.
	});


	res.json(filteredInfluencers);
});


// GET /employees  (provide employee data to the front-end)
app.get('/employees', (req, res) => {
	res.json(employees);
});

// Add a general error handler for anything not caught by specific endpoint handlers
app.use((err, req, res, next) => {

	console.error("Unhandled Server Error:", err);
	res.status(500).json({ error: 'An unexpected server error occurred.' });
});


// ... other endpoints as needed (e.g., update influencer, assign manager)

app.listen(port, () => console.log(`Server listening on port ${port}`));

