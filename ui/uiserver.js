require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('isomorphic-fetch');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const template = require('./template.js');

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();

app.use(express.static('public'));
app.use(cookieParser());

app.get('/env.js', (req, res) => {
	const env = {
		UI_SERVER_ORIGIN: process.env.UI_SERVER_ORIGIN,
		UI_API_SSE_ENDPOINT: process.env.UI_API_SSE_ENDPOINT,
		UI_API_GRAPHQL_ENDPOINT: process.env.UI_API_GRAPHQL_ENDPOINT,
		UI_API_IMAGE_ENDPOINT: process.env.UI_API_IMAGE_ENDPOINT,
		UI_API_AUTH_ENDPOINT: process.env.UI_API_AUTH_ENDPOINT,
		UI_API_EMAIL_ENDPOINT: process.env.UI_API_EMAIL_ENDPOINT,
    	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    	POST_LIMIT: process.env.POST_LIMIT,
    	CMT_LIMIT: process.env.CMT_LIMIT,
    	SUBCMT_LIMIT: process.env.SUBCMT_LIMIT,
	};
	res.send(`window.ENV = ${JSON.stringify(env)}`);
});

app.get('*', async (req, res) => {
	res.setHeader('Cache-Control', 'no-cache, no-store'); //forbid caching to prevent back button navigation auth problems...
	const token = req.cookies.jwt;
	if (!token) return res.sendFile(path.join(__dirname, './public', 'unauthIndex.html'));
	try {
		const credentials = jwt.verify(token, JWT_SECRET);
		if (credentials['signUp']) { //token cannot be tampered with (?) so we're safe
			return res.sendFile(path.join(__dirname, './public', 'unauthIndex.html'));
		} else {
			const { name, email } = credentials;
			return res.send(template({ name, email }));
		}
	} catch (error) {
		console.log(error);
		return res.sendFile(path.join(__dirname, './public', 'unauthIndex.html')); //change to error page?
	}
});

const port = process.env.UI_SERVER_PORT || 8000;
app.listen(port, () => {
	console.log(`UI started on port ${port}`);
});

module.exports = app;