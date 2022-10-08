var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('../models.js');
const db = require('./db.js');
const Group = mongoose.model('Group');
const User = mongoose.model('User');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');
const Conversation = mongoose.model('Conversation');
const Message = mongoose.model('Message');

async function execute() {
	try {
		const dbURI = 'mongodb+srv://brian:CtA00CPWEjc4GTz0@cluster0-n6xfz.mongodb.net/test?retryWrites=true&w=majority';
		mongoose.connect(dbURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		});
		mongoose.connection.on('connected', () => {
			console.log(`Mongoose connected to ${dbURI}`);
		});
		mongoose.connection.on('disconnected', () => {
			console.log('Mongoose disconnected');
		});

		/* Test queries begin */

		const group = await Group.findOne({ name: 'ballers' });
		const userId = group.posts[0].author;
		console.log(group._id);
		//console.log(group);

		const postId = group.posts[0]._id;
		/*const commentId = group.posts[0].comments[0]._id;
		const res = await Group.findOneAndUpdate({ _id: group._id, "posts._id": postId}, {
			$addToSet: { "posts.$.likes": userId } 
		}, {
			new: true,
		});
		
		const res1 = await Group.findOneAndUpdate({ _id: group._id }, 
			{
				$addToSet: { "posts.$[i].comments.$[j].likes": userId } 
			},
			{
				arrayFilters: [
					{
						"i._id": postId,
					}, 
					{
						"j._id": commentId,
					} 
				],
				new: true
			},
		);
		//console.log(res1.posts[0].comments);


		const res2 = await Group.findOneAndUpdate({ _id: group._id }, 
			{
				$inc: { "posts.$[i].counter": 1 } 
			},
			{
				arrayFilters: [
					{
						"i._id": postId,
					}, 
				],
				new: true,
			},
		);
		/*setTimeout(() => {
			console.log('hi');
			console.log(res2.posts.id(postId).counter)
		}, 2000);*/

		/*const res3 = await Group.findOneAndUpdate({ _id: group._id }, 
			{
				$inc: { "posts.$[i].counter": 1 } 
			},
			{
				arrayFilters: [
					{
						"i._id": postId,
					}, 
				],
				new: true,
			},
		);*/
		//console.log('by');
		//console.log(res3.posts.id(postId).counter)
	
		//console.log(group.posts[0].comments[0]);

		//retrieve n subdocuments after a certain timestamp
		const performance = require('perf_hooks').performance;

		/*
		let avg_time = 0;
		let posts;
		for (let i = 0; i < 50; i ++) {
			t0 = performance.now();
			posts = await Group.aggregate([
				{ $match: { _id: group._id } }, //need to cast string to ObjectId
				{ $unwind: { path: "$posts" } },
				{ $replaceRoot: { newRoot: "$posts" } },
				{ $match: { "index" : { "$lt": 80 } } },
				{ $limit: 20 },
				{ $sort: { "index": -1 } }, //no cost
				{ $addFields: {
					numComments: { $sum: "$comments.numComments" },
					numLikes: { $size: "$likes" },
					userLiked: { $in: [userId, "$likes"] },
				} },
				{ $project: { 
					comments: 0
				}},
			]);
			t1 = performance.now();
			avg_time += t1 - t0;
		}
		console.log('GroupPosts retrieval time: ', avg_time / 50);
		//console.log(posts);


		avg_time = 0;
		for (let i = 0; i < 50; i ++) {
			t0 = performance.now();
			posts = await Group.aggregate([
				{ $match: { _id: group._id } }, //need to cast string to ObjectId
				{ $unwind: { path: "$posts" } },
				//{ $replaceRoot: { newRoot: "$posts" } },
				{ $match: { "posts.index" : { "$lt": 80 } } },
				{ $limit: 20 },
				{ $sort: { "posts.index": -1 } }, //no cost
				{ $addFields: {
					numComments: { $sum: "$posts.comments.numComments" },
					numLikes: { $size: "$posts.likes" },
					userLiked: { $in: [userId, "$posts.likes"] },
				} },
				{ $project: { 
					"posts.comments": 0
				}},
			]);
			t1 = performance.now();
			avg_time += t1 - t0;
		}
		console.log('GroupPosts retrieval time: ', avg_time / 50);*/

		const y = [];
		t0 = performance.now();
		for (let i = 0; i < 50; i++) {
			let post = Group.findById(group._id, function(group, err) {
				y.push(group);
				if (i === 49) {
					t1 = performance.now();
					console.log('for loop time: ', t1 - t0);
				}
			});
		}


		const x = [{cat: 5, _id: userId}];
		await Post.populate(x, {
			path: '_id',
			select: 'name avatarHash'
		});

		let z = await test();
		console.log(z);

		//let f = [1, 2, 3];
		//f = f.map(async (f) => test());
		//Promise.all(f).then((result) => console.log(result));

		const userId2 = mongoose.Types.ObjectId('5e890b43740a576cd5eef7f6');

		let convos = await Conversation.find(
			{ participants: { $in: [userId2] } }, '_id participants'
		);
		convos = convos.map((convo) => {
			let buddyId = convo.participants[0]._id === userId ? convo.participants[1]._id : convo.participants[0]._id;
			return { convoId: convo._id, buddyId };
		});
		
		convos = convos.map(async (convo) => {
			return Message.find({ convoId: convo.convoId }).sort({ timestamp: -1 }).limit(1).exec(function(err, message) {
				console.log(err, message);
				return { message };
			});
		});

		Promise.all(convos).then((result) => console.log(result));

		//




	} catch (e) {
		console.log(e);
	} finally {
		//mongoose.connection.close();
	}
}

async function test() {
	try {
		for (let i = 0; i < 2; i ++) {
			await setTimeout(() => (null), 1000);
			if (i === 1) {
				return 5;
			}
		}
	} catch(e) {
		console.log(e);
		throw e;
	}
}

execute();






