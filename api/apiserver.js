require('dotenv').config();
require('./db.js');
const mongoose = require('mongoose');
const Message = mongoose.model('Message');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const formData = require("express-form-data");
const cloudinary = require('cloudinary');
var mailer = require('express-mailer');
const cors = require('cors');
const { EventEmitter } = require('events');

const { installHandler } = require('./api_handler.js');
const auth = require('./auth.js');
const { expandedPostSse, newsfeedSse } = require('./sseHandlers.js');

const eventEmitter = new EventEmitter();
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.set('eventEmitter', eventEmitter);
app.get('eventEmitter').setMaxListeners(0);

const origin = process.env.UI_SERVER_ORIGIN || 'http://localhost:8000';

app.use(cors({ origin, credentials: true }));
app.use(formData.parse()); //middleware for parsing form data (ex images)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

//cloudinary setup
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
})

//email setup
mailer.extend(app, {
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

installHandler(app); //install apollo server middleware

app.use('/auth', auth.routes);

app.post('/image-upload', (req, res) => {
	const image = Object.values(req.files)[0];
	cloudinary.uploader.upload(image.path, (result) => {
		res.json(result);
	});
});

app.post('/mail', (req, res) => {
	app.mailer.send('email', {
		to: 'blh2136@columbia.edu',
		subject: 'Test Email',   
	}, function(err) {
		if(err) {
	  		console.log(err);
	  		res.status(500).json({ "message": "error sending email" });
	  		return;
		}
		res.status(200).send('Email Sent');
	});
});

//server side events
app.get('/sse', (req, res) => newsfeedSse(req, res, app.get('eventEmitter')));
app.get('/sse/expandedPost', (req, res) => expandedPostSse(req, res, app.get('eventEmitter')));

//websockets for chat
io.on('connection', function(socket) {
  socket.on('join_solo_room', function(room) {
  	console.log(room);
  	socket.join(room); //user id
  });

  socket.on('join_shared_room', async function(room) {
  	socket.join(room);  //unique joint id	
  	const messages = await Message.find({ convoId: room }).sort({ timestamp: 1});
  	io.to(room).emit('message_history', messages);
  });

  socket.on('message', async function(data) {
  	io.to(data.soloRoom).emit('message', data.message); //send notif to other person
  	io.to(data.sharedRoom).emit('message', data.message); //send message to shared chatroom
  	const message = new Message(data.message);
  	await message.save();
  })
});

const port = process.env.API_SERVER_PORT || 3000;
server.listen(port, () => {
	console.log(`API server started on port ${port}`);
});
