require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const eventSchema = new mongoose.Schema({
	title: { type: String, require: true },
	description: { type: String },
	imageURL: { type: String },
	date: { type: Date },
	lat: { type: Number },
	lng: { type: Number },
});

eventSchema.index({ title: 'text', description: 'text' });

const userSchema = new mongoose.Schema({
	//sub: { type: String, require: true, unique: true },
	email: { type: String, unique: true, required: true, index: true },
	name: { type: String, required: true },
	hash: String, //hashed password
	salt: String,
	groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
	avatarHash: { type: String },
});

userSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto
		.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
		.toString('hex');
};

userSchema.methods.setHashedPassword = function (hash, salt) {
	this.hash = hash;
	this.salt = salt
};

userSchema.methods.validPassword = function (password) {
	const hash = crypto
		.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
		.toString('hex');
	return this.hash === hash;
};

userSchema.methods.generateJwt = function () {
	return jwt.sign({
		_id: this._id,
		email: this.email,
		name: this.name,
	}, process.env.JWT_SECRET); //payload of the jwt is publicly accessible, signature is not
};

const subcommentSchema = new mongoose.Schema({
	index: { type: Number, index: true, unique: true },
	author: { type: Schema.Types.ObjectId, ref: 'User', require: true },
	timestamp: { type: Date, "default": Date.now()} ,
	text: { type: String, require: true },
	likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

const commentSchema = new mongoose.Schema({
	index: { type: Number, index: true, unique: true },
	counter: { type: Number, default: 0 },
	author: { type: Schema.Types.ObjectId, ref: 'User', require: true },
	timestamp: { type: Date, "default": Date.now()} ,
	text: { type: String, require: true },
	likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	subcomments: [subcommentSchema],
	numComments: { type: Number, default: 1 }, //for ease of computation
});

const postSchema = new mongoose.Schema({
	index: { type: Number, index: true, },
	author: { type: Schema.Types.ObjectId, ref: 'User', require: true },
	timestamp: {type: Date, "default": Date.now()},
	text: { type: String, require: true },
	likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	comments: [commentSchema],
	counter: { type: Number, default: 0 }
});

/*postSchema.path('likes').validate(function(value) { //value is the new value of the path!
	console.log(this.likes, value);
	if (this.likes.includes(value)) { //no duplicate users 
		return false;
	}
});*/

const groupSchema = new mongoose.Schema({
	name: { type: String, required: true },
	posts: [postSchema],
	members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	counter: { type: Number, default: 0 },
});

const conversationSchema = new mongoose.Schema({
	participants: [{ type: Schema.Types.ObjectId }]
});

const messageSchema = new mongoose.Schema({
	sender: { type: Schema.Types.ObjectId },
	msg: { type: String },
	timestamp: { type: Date, index: true },
	convoId: { type: Schema.Types.ObjectId, index: true }
});

mongoose.model('Event', eventSchema);
mongoose.model('User', userSchema);
mongoose.model('Comment', commentSchema);
mongoose.model('Subcomment', subcommentSchema);
mongoose.model('Post', postSchema);
mongoose.model('Group', groupSchema);
mongoose.model('Conversation', conversationSchema);
mongoose.model('Message', messageSchema);