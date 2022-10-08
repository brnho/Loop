var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('../models.js');
const db = require('./db.js');
const Group = mongoose.model('Group');
const User = mongoose.model('User');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');

async function createPost(groupId, authorId, postId, text) { 
	try {
		let group = await Group.findOneAndUpdate({ _id: groupId }, //atomic update
			{ $inc: { counter: 1 } },
			{ new: true }
		);
		if (!group) return false;
		const index = group.counter;
		const data = await Group.findOneAndUpdate({ _id: groupId }, 
			{
				$push: {
					"posts": {
						$each: [{ _id: postId, index, author: authorId, text }],
						$sort: { index: -1 }
					}
				},
			},
			{ "new": true, rawResult: true }
		);
	} catch (e) {
		throw e;
	}
}

async function createComment(groupId, postId, commentId, authorId, text) {
	try {
		const group = await Group.findOneAndUpdate({ _id: groupId }, 
			{ $inc: { "posts.$[i].counter": 1 } },
			{
				arrayFilters: [
					{
						"i._id": postId,
					}, 
				],
				new: true,
			},
		);
		const index = group.posts.id(postId).counter; 
		const data = await Group.findOneAndUpdate({ _id: groupId }, 
			{
				$push: {
					"posts.$[i].comments": {
						$each: [{ _id: commentId, index, author: authorId, text }],
						$sort: { index: 1 }
					}
				},
			},
			{
				arrayFilters: [{ "i._id": postId }], "new": true, rawResult: true
			}
		);
	} catch (e) {
		throw e;
	}
}

async function createSubcomment(groupId, postId, commentId, authorId, text) {
	try {
		const group = await Group.findOneAndUpdate({ _id: groupId }, 
			{ $inc: { "posts.$[i].comments.$[j].counter": 1 } },
			{
				arrayFilters: [{ "i._id": postId }, { "j._id": commentId }],
				new: true,
			},
		);
		const index = group.posts.id(postId).comments.id(commentId).counter;
		const data = await Group.findOneAndUpdate({ _id: groupId }, 
			{
				$push: {
					"posts.$[i].comments.$[j].subcomments": {
						$each: [{ author: authorId, text, index }],
						$sort: { timestamp: 1 }
					}
				},
				$inc: { "posts.$[i].comments.$[j].numComments": 1 } 
			},
			{
				arrayFilters: [{ "i._id": postId }, { "j._id": commentId }], new: true, rawResult: true
			}
		);
	} catch (e) {
		throw e;
	}
}

async function reset() {
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

		try {
			await Group.collection.drop();
		} catch (e) {}

		const groups = await Group.create(db.groups);

		try {
			await User.collection.drop();
		} catch (e) {}

		const performance = require('perf_hooks').performance;

		const userIds = [];
		for (const person of db.users) {
			const user = new User();
			user.name = person.name;
			user.email = person.email;
			user.avatarHash = person.avatarHash;
			user.setPassword(person.password);
			const savedUser = await user.save();
			userIds.push(savedUser._id);
		}

		let group1 = groups[0];
		let t0 = performance.now();
		for (let i = 0; i < 6; i++) { 
			if (i % 100 === 0) {
				t1 = performance.now();
				console.log(t1 - t0, i);
				t0 = performance.now();
			}
			let postId =  mongoose.Types.ObjectId();
			await createPost(group1._id, userIds[i % 20], postId, db.posts[i].text); 
			for (let j = 0; j < 7; j++) {
				let commentId =  mongoose.Types.ObjectId();
				await createComment(group1._id, postId, commentId, userIds[j % 20], db.comments[j].text);
				if (j % 2 == 0) {
					for (let k = 0; k < 5; k++) {
						await createSubcomment(group1._id, postId, commentId, userIds[k % 20], db.subcomments[k].text) 
					}
				}
			}
		}

		let group2 = groups[1];
		for (let i = 3; i < 6; i++) { 
			let postId =  mongoose.Types.ObjectId();
			await createPost(group2._id, userIds[i % 20], postId, db.posts[i].text);
			for (let j = 0; j < 7; j++) {
				let commentId =  mongoose.Types.ObjectId();
				await createComment(group2._id, postId, commentId, userIds[j % 20], db.comments[j].text);
				if (j % 2 == 0) {
					for (let k = 0; k < 5; k++) {
						await createSubcomment(group2._id, postId, commentId, userIds[k % 20], db.subcomments[k].text) 
					}
				}
			}
		}

		const groupIds = groups.map((group) => (group._id));
		await User.updateMany({}, { $set: { groups: groupIds } });
		await Group.updateMany({}, { $set: { members: userIds } });

	} catch (e) {
		console.log(e);
	} finally {
		mongoose.connection.close();
	}
}

reset();






