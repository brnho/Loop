const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');
const User = mongoose.model('User');
const Group = mongoose.model('Group');

async function createPost(_, { groupId, post }, { req }) { 
	try {
		const { authorId, text } = post;
		let group = await Group.findOneAndUpdate({ _id: groupId }, //atomic update
			{ $inc: { counter: 1 } },
			{ new: true }
		);
		if (!group) return false;
		const index = group.counter;
		const postId = mongoose.Types.ObjectId()
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
		if (!data.lastErrorObject.updatedExisting) return false;
		let savedPost = data.value.posts.id(postId);
		await Post.populate(savedPost, {
			path: 'author',
			select: 'name avatarHash',
		})
		req.app.get('eventEmitter').emit('create_post_mutation', { groupId, postId, post: savedPost });
		return true;
	} catch (e) {
		throw e;
	}
}

async function createComment(_, { groupId, postId, comment }, { req }) {
	try {
		const { authorId, text } = comment;
		if (!authorId) throw "missing author id";
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
		const index = group.posts.id(postId).counter; //I tested this and it is indeed atomic (group refers to the returned doc)
		const commentId = mongoose.Types.ObjectId(); 
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
		if (!data.lastErrorObject.updatedExisting) return false;
		const comments = data.value.posts.id(postId).comments;
		const savedComment = comments.id(commentId);
		await Comment.populate(savedComment, {
			path: 'author',
			select: 'name avatarHash',
		});
		req.app.get('eventEmitter').emit('create_comment_mutation', { groupId, postId, comment: savedComment });
		return true;
	} catch (e) {
		throw e;
	}
}

async function createSubcomment(_, { groupId, postId, commentId, subcomment }, { req }) {
	try {
		const { authorId, text } = subcomment;
		if (!authorId) throw "missing author id";
		const group = await Group.findOneAndUpdate({ _id: groupId }, 
			{ $inc: { "posts.$[i].comments.$[j].counter": 1 } },
			{
				arrayFilters: [{ "i._id": postId }, { "j._id": commentId }],
				new: true,
			},
		);
		const index = group.posts.id(postId).comments.id(commentId).counter;
		const subcommentId = mongoose.Types.ObjectId(); 
		const data = await Group.findOneAndUpdate({ _id: groupId }, 
			{
				$push: {
					"posts.$[i].comments.$[j].subcomments": {
						$each: [{ _id: subcommentId, index, author: authorId, text }],
						$sort: { index: 1 }
					}
				},
				$inc: { "posts.$[i].comments.$[j].numComments": 1 } 
			},
			{
				arrayFilters: [{ "i._id": postId }, { "j._id": commentId }], new: true, rawResult: true
			}
		);
		if (!data.lastErrorObject.updatedExisting) return false;
		const savedSubcomment = data.value.posts.id(postId).comments.id(commentId).subcomments.id(subcommentId);
		await Comment.populate(savedSubcomment, {
			path: 'author',
			select: 'name avatarHash',
		});
		req.app.get('eventEmitter').emit('create_subcomment_mutation', { 
			groupId, postId, commentId, subcomment: savedSubcomment 
		});
		return true;
	} catch (e) {
		throw e;
	}
}

async function deletePost(_, { groupId, postId }, { req }) {
	try {
		const group = await Group.findById(groupId);
		if (!group) return false;
		const post = group.posts.id(postId);
		const text = post.text;
		if (!post) return false;
		post.remove();
		await group.save();
		req.app.get('eventEmitter').emit('delete_post_mutation', { groupId, postId });
		return true; 
	} catch (e) {
		throw e;
	}
}

async function deleteComment(_, { groupId, postId, commentId }, { req }) {
	try {
		const group = await Group.findById(groupId);
		if (!group) return false;
		const post = group.posts.id(postId);
		if (!post) return false;
		const comment = post.comments.id(commentId);
		if (!comment) return false;
		comment.remove();
		await group.save();
		req.app.get('eventEmitter').emit('delete_comment_mutation', { groupId, postId, commentId });
		return true; 
	} catch (e) {
		throw e;
	}
}

async function deleteSubcomment(_, { groupId, postId, commentId, subcommentId }, { req }) {
	try {
		const group = await Group.findById(groupId);
		if (!group) return false;
		const post = group.posts.id(postId);
		if (!post) return false;
		const comment = post.comments.id(commentId);
		if (!comment) return false;
		const subcomment = comment.subcomments.id(subcommentId);
		if( !subcomment) return false;
		subcomment.remove();
		await group.save();
		await Group.findOneAndUpdate({ _id: groupId }, //regretably slow
			{
				$inc: { "posts.$[i].comments.$[j].numComments": -1 } 
			},
			{
				arrayFilters: [{ "i._id": postId }, { "j._id": commentId }]
			},
		);
		req.app.get('eventEmitter').emit('delete_subcomment_mutation', { groupId, postId, commentId, subcommentId });
		return true; 
	} catch (e) {
		throw e;
	}
}

async function likePost(_, { userId, groupId, postId }, { req }) {
	try {
		const group = await Group.findOneAndUpdate({ _id: groupId, 'posts._id': postId }, 
			{ $addToSet: { "posts.$.likes": userId } },	
			{ new: true, rawResult: true },
		);
		if (!group.lastErrorObject.updatedExisting) return false;
		req.app.get('eventEmitter').emit('like_post_mutation', { groupId, postId, userId });
		return true;
	} catch (e) {
		throw e;
	}
}

async function unlikePost(_, { userId, groupId, postId }, { req }) {
	try {
		const group = await Group.findOneAndUpdate({ _id: groupId, 'posts._id': postId }, 
			{ $pull: { "posts.$.likes": userId } },	
			{ new: true, rawResult: true },
		);
		if (!group.lastErrorObject.updatedExisting) return false;
		req.app.get('eventEmitter').emit('unlike_post_mutation', { groupId, postId, userId });
		return true;
	} catch (e) {
		throw e;
	}
}

async function likeComment(_, { userId, groupId, postId, commentId }, { req }) {
	try {
		const group = await Group.findOneAndUpdate({ _id: groupId }, 
			{
				$addToSet: { "posts.$[i].comments.$[j].likes": userId } 
			},
			{
				arrayFilters: [{ "i._id": postId }, { "j._id": commentId }],
				new: true,
				rawResult: true,
			},
		);
		if (!group.lastErrorObject.updatedExisting) return false;
		req.app.get('eventEmitter').emit('like_comment_mutation', { groupId, postId, commentId, userId });
		return true;
	} catch (e) {
		throw e;
	}
}

async function unlikeComment(_, { userId, groupId, postId, commentId }, { req }) {
	try {
		const group = await Group.findOneAndUpdate({ _id: groupId }, 
			{
				$pull: { "posts.$[i].comments.$[j].likes": userId } 
			},
			{
				arrayFilters: [{ "i._id": postId }, { "j._id": commentId }],
				new: true,
				rawResult: true,
			},
		);
		if (!group.lastErrorObject.updatedExisting) return false;
		req.app.get('eventEmitter').emit('unlike_comment_mutation', { groupId, postId, commentId, userId });
		return true;
	} catch (e) {
		throw e;
	}
}

async function likeSubcomment(_, { userId, groupId, postId, commentId, subcommentId }, { req }) {
	try {
		const group = await Group.findOneAndUpdate({ _id: groupId }, 
			{
				$addToSet: { "posts.$[i].comments.$[j].subcomments.$[k].likes": userId } 
			},
			{
				arrayFilters: [{ "i._id": postId }, { "j._id": commentId }, { "k._id": subcommentId }],
				new: true,
				rawResult: true,
			},
		);
		if (!group.lastErrorObject.updatedExisting) return false;
		req.app.get('eventEmitter').emit('like_subcomment_mutation', { groupId, postId, commentId, subcommentId, userId });
		return true;
	} catch (e) {
		throw e;
	}
}

async function unlikeSubcomment(_, { userId, groupId, postId, commentId, subcommentId }, { req }) {
	try {
		const group = await Group.findOneAndUpdate({ _id: groupId }, 
			{
				$pull: { "posts.$[i].comments.$[j].subcomments.$[k].likes": userId } 
			},
			{
				arrayFilters: [{ "i._id": postId }, { "j._id": commentId }, { "k._id": subcommentId }],
				new: true,
				rawResult: true,
			},
		);
		if (!group.lastErrorObject.updatedExisting) return false;
		req.app.get('eventEmitter').emit('unlike_subcomment_mutation', { groupId, postId, commentId, subcommentId, userId });
		return true;
	} catch (e) {
		throw e;
	}
}

module.exports = { 
	createPost, createComment, createSubcomment, deletePost, 
	deleteComment, deleteSubcomment, likePost, unlikePost, likeComment,
	unlikeComment, likeSubcomment, unlikeSubcomment, 
};