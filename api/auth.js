require('dotenv').config();
const Router = require('express');
const passport = require('passport');
require('./passportConfig.js');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const mailer = require('express-mailer');
const { AuthenticationError } = require('apollo-server-express');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');

let { JWT_SECRET, KEY, IV } = process.env;

if (!JWT_SECRET) {
	if (process.env.NODE_ENV !== 'production') {
		JWT_SECRET = 'tempjwtsecretfordevonly';
		console.log('Missing env var JWT_SECRET. Using unsafe dev secret');
	} else {
		console.log('Missing env var JWT_SECRET. Authentication disabled');
	}
}

const routes = new Router();
routes.use(passport.initialize());

//email setup
mailer.extend(routes, {
  from: 'no-reply@example.com',
  host: 'smtp.googlemail.com',
  secureConnection: true,
  port: 465, //465 for SSL, 587 for TLS
  transportMethod: 'SMTP',  
  auth: {
    user: 'leunion4@gmail.com', 
    pass: 'Chipotle12',
  }
});

const origin = process.env.UI_SERVER_ORIGIN || 'http://localhost:8000';
routes.use(cors({ origin, credentials: true }));

function encrypt(data) {
	let cipher = crypto.createCipheriv('aes-256-cbc', KEY, IV);
	let encrypted = cipher.update(data)
	encrypted = Buffer.concat([encrypted, cipher.final()]).toString('hex');
	return encrypted;
}

function decrypt(data) {
	let encrypted = Buffer.from(data, 'hex');
	let decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
	let decrypted = decipher.update(encrypted);
	decrypted = Buffer.concat([decrypted, decipher.final()]).toString();
	return decrypted;
}

async function verifyGoogleToken(req, res) {
	if (!JWT_SECRET) {
		res.status(500).send('Missing JWT_SECRET. Refusing to authenticate');
		return;
	}

	const googleToken = req.body.google_token;
	if (!googleToken) {
		res.status(400).send({ message: 'Missing Token' });
		return;
	}

	const client = new OAuth2Client();
	let payload;
	try {
		const ticket = await client.verifyIdToken({ idToken: googleToken }); 
		payload = ticket.getPayload();
	} catch (error) {
		res.status(403).send('Invalid credentials');
		console.log(error);
		return;
	}
	return payload;
}

routes.post('/signup', async (req, res) => {
	const { name, email, password } = req.body;
	if (!name || !email || !password) {
		return res.status(404).send('All fields required');
	}
	try {
		const result = await User.findOne({ email });
		if (result) {
			return res.status(409).send('Duplicate email');
		}
	} catch (e) {
		console.log(e);
		return res.status(400).send('Error');
	}
	const num = Math.floor(100000 + Math.random() * 900000);
	//hash password before storing in cookie for extra security
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
	let credentials = {
		name, email, salt, hash, num,
	};
	credentials = encrypt(JSON.stringify(credentials)); //encrypt jwt payload
	const token = jwt.sign({ signUp: true, credentials }, JWT_SECRET);

	routes.mailer.send('email', {
		to: 'blh2136@columbia.edu',
		subject: 'Secret Num Inside',  
		num: num, 
	}, function(err) {
		if(err) {
	  		console.log(err);
	  		res.status(400).send('Error sending email');
	  		return;
		}
		res.cookie('jwt', token, { httpOnly: true }).sendStatus(200);
	});
});

routes.post('/verify', async (req, res) => {
	const token = req.cookies.jwt;
	if (!token) {
		res.status(404).send("Error: no cookie found");
		return;
	}
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		if (payload['signUp']) {
			let credentials = payload['credentials'];
			credentials = JSON.parse(decrypt(credentials));
			const { name, email, salt, hash, num } = credentials;
			if (parseInt(req.body.num) === parseInt(num)) {
				const user = new User();
				user.name = name;
				user.email = email;
				user.setHashedPassword(hash, salt); 
				const savedUser = await user.save();
				const token = jwt.sign({ 
					signedIn: true,
					name: savedUser.name,
					email: savedUser.email,
				}, JWT_SECRET);
				res.cookie('jwt', token, { httpOnly: true }).status(200);
				res.json({ signedIn: true, name, email });
			} else {
				res.status(403).send('Incorrect number');
			}
		} else {
			throw "improper cookie";
		}
	} catch (e) {
		console.log(e);
		res.status(400).send('Error');
	}
});

routes.post('/signin', (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(404).send('All fields required');
	}
	 passport.authenticate('local', (err, user, info) => {
		if (err) {
			return res.status(404).json(err);
		}
		if (user) {
			const credentials = { signedIn: true, name: user.name, email: user.email };
			const token = jwt.sign(credentials, JWT_SECRET);
			res.cookie('jwt', token, { httpOnly: true });
			res.status(200).json(credentials);
		} else {
			res.status(401).json(info);
		}
	})(req, res);
});

routes.post('/signout', async (req, res) => {	
	res.clearCookie('jwt');
	res.json({ status: 'ok' });
});

function mustBeSignedIn(resolver) {
	return (root, args, { user }) => {
		if (!user || !user.signedIn) {
			throw new AuthenticationError('You must be signed in');
		}
		return resolver(root, args, { user });
	};
}

module.exports = { routes, mustBeSignedIn };