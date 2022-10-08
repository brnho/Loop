require('dotenv').config();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');
const Subcomment = mongoose.model('Subcomment');
const User = mongoose.model('User');
const Group = mongoose.model('Group');
const Conversation = mongoose.model('Conversation');
const Message = mongoose.model('Message');

async function userInfo(_, { email }) { //retrieve a user's groups and avatar hash
	try {
		const user = await User.findOne({ email }, 'avatarHash').populate('groups', '_id name');
		return user;
	} catch (e) {
		throw e;
	}
}

async function groupPosts(_, { userId, groupId, index }) { //retrieve a group's posts
	try {
		let query = {};
		if (index) {
			query = { "index" : { "$lt": index } };
		}
		const posts = await Group.aggregate([
			{ $match: { _id: mongoose.Types.ObjectId(groupId) } }, //need to cast string to ObjectId
			{ $unwind: { path: "$posts" } },
			{ $replaceRoot: { newRoot: "$posts" } },
			{ $match: query },
			{ $limit: parseInt(process.env.POST_LIMIT) },
			{ $sort: { "index": -1 } },
			{ $addFields: {
				numComments: { $sum: "$comments.numComments" },
				numLikes: { $size: "$likes" },
				userLiked: { $in: [mongoose.Types.ObjectId(userId), "$likes"] },
			} },
			{ $project: { 
				comments: 0
			}},
		]);
		await Post.populate(posts, { //populate subdoc
			path: 'author',
			select: 'name avatarHash',
		});
		return posts;
	} catch (e) {
		throw e;
	}
}

async function groupMembers(_, { groupId }) { //retrieve a group's members
	try {
		const group = await Group.findById(groupId).populate({
			path: 'members', 
			select: 'name avatarHash',
			options: { limit: 6 },
		});
		return group.members;
	} catch (e) {
		throw e;
	}
}

async function singlePost_post(_, { userId, groupId, postId }) {
	try {
		const group = await Group.findById(groupId);
		const post = await group.posts.id(postId);
		await Post.populate(post, { 
			path: 'author',
			select: 'name avatarHash',
		});
		let numComments = 0;
		for (const comment of post.comments) {
			numComments += comment.numComments;
		}
		post.numComments = numComments;
		if (post.likes.includes(mongoose.Types.ObjectId(userId))) {
			post.userLiked = true;
		} else {
			post.userLiked = false;
		}
		post.numLikes = post.likes.length;
		return post;
	} catch (e) {
		console.log(e);
		throw e;
	}
}

async function singlePost_comments(_, { groupId, postId, index }) {
	try {
		const query = index ? { "index": { $gt: index } } : {};
		const comments = await Group.aggregate([
			//match the required group document
			{ $match: { _id: mongoose.Types.ObjectId(groupId) } },

			//unwind the posts subdocument array
			{ $unwind: { path: "$posts" } },

			//match the required post subdocument
			{ $match: { 'posts._id': mongoose.Types.ObjectId(postId) } },

			//unwind the comments subdocument array
			{ $unwind: { path: "$posts.comments" } },

			//push the comment subdocument to the top level
			{ $replaceRoot: { newRoot: "$posts.comments" } },

			//keep only comments with a timestamp greater than a certain date
			{ $match: query },

			//sort the comments by index in ascending order
			{ $sort: { "index": 1 } },

			//limit to n comments
			{ $limit: parseInt(process.env.CMT_LIMIT) },

			//retrieve first m subcomments (which are already sorted)
			{ $set: { "subcomments": { $slice: ["$subcomments", parseInt(process.env.SUBCMT_LIMIT)] },} }, 
		]); 
		await Comment.populate(comments, {
			path: 'author',
			select: 'name avatarHash',
		});
		await Comment.populate(comments, {
			path: 'subcomments.author',
			select: 'name avatarHash',
		});
		return comments;
	} catch (e) {
		throw e;
	}
}

async function singlePost_subcomments(_, { groupId, postId, commentId, index }) {
	try {
		const group = await Group.findById(groupId);
		const subcomments = group.posts.id(mongoose.Types.ObjectId(postId))
			.comments.id(mongoose.Types.ObjectId(commentId)).subcomments;
		const filtered = subcomments.filter((subcomment) => subcomment.index > index);
		const result = filtered.slice(0, parseInt(process.env.SUBCMT_LIMIT));
		await Comment.populate(result, {
			path: 'author',
			select: 'name avatarHash',
		}); 
		return result;
	} catch (e) {
		throw e;
	}	
} 

async function singlePostStats(_, { userId, groupId, postId }) {
	try {
		const posts = await Group.aggregate([
			{ $match: { _id: mongoose.Types.ObjectId(groupId) } }, 
			{ $unwind: { path: "$posts" } },
			{ $match: { 'posts._id': mongoose.Types.ObjectId(postId) } },
			{ $project: { 
				_id: '$posts._id',
				numComments: { $sum: "$posts.comments.numComments" },
				numLikes: { $size: "$posts.likes" },
				userLiked: { $in: [mongoose.Types.ObjectId(userId), "$posts.likes"] },  
			}},
		]); //returns [{ post }]
		const post = posts[0];
		return post;
	} catch(e) {
		throw e;
	}
}

async function getPostLikes(_, { groupId, postId }) {
	try {
		const group = await Group.findById(groupId);
		const post = await group.posts.id(postId);
		await Post.populate(post, {
			path: 'likes',
			select: '_id name avatarHash'
		});
		return post.likes;
	} catch (e) {
		throw e;
	}
}

async function getConvoId(_, { user1Id, user2Id }) {
	try {
		const convo = await Conversation.findOne(
			{ participants: { $all: [mongoose.Types.ObjectId(user1Id), mongoose.Types.ObjectId(user2Id)] } }
		);
		if (convo) {
			return convo._id;
		} else {
			const convo = new Conversation({ participants: [user1Id, user2Id] });
			await convo.save();
			return convo._id;
		}
	} catch (e) {
		throw e;
	}
}


//get all ppl you have convos with, order by time, display last message

//to display: we need msg, user avatar hash 
//need unique convo id to grab messages
//given list of unique convo ids, for each id, retrieve most recent message 
//groupby convoid, then take first? 


//get docs of convoIds (or participants?)
//Search for messages based on the LIST of convoIds
//how to match messages with the chat buddy id? 

/*
[{ convoId, buddyId }]

result = [{ buddyId, message }] (but need avatarHash)

*/

/*
async function getConvoIds(_, { userId }) {
	try {
		let convos = await Conversation.find(
			{ participants: { $in: [mongoose.Types.ObjectId(userId)] } }, '_id participants'
		);
		convos = convos.map((convo) => {
			let buddyId = convo.participants[0]._id === userId ? convo.participants[1]._id : convo.participants[0]._id;
			return { convoId: convo._id, buddyId };
		});
//retrieve n, then sort
//create new obj, then return... so map?
		
		convos = convos.map(async (convo) => {
			Message.find({ convoId: convo.convoId }).sort({ timestamp: -1 }).limit(1).exec(function(err, message) {
				return { message, }
			});

		})

		if (convo) {
			return convo._id;
		} else {
			const convo = new Conversation({ participants: [user1Id, user2Id] });
			await convo.save();
			return convo._id;
		}
	} catch (e) {
		throw e;
	}
}*/

module.exports = { 
	userInfo, groupPosts, groupMembers, singlePost_post, 
	singlePost_comments, singlePost_subcomments, singlePostStats, getPostLikes, getConvoId 
};