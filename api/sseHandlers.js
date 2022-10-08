function expandedPostSse(req, res, eventEmitter) { 
	const groupId = req.query.groupId;
	const postId = req.query.postId;

	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive',
	});

	const onCreateCommentMutation = (data) => {
		if (groupId === data.groupId && postId === data.postId) { //only send notif if event happened in our group and post
			res.write("event: create_comment_mutation\n"); //must be named message
			res.write(`data: ${JSON.stringify({ comment: data.comment })}\n\n`); //"data" required for complete response
		}
	}

	const onCreateSubcommentMutation = (data) => {
		if (groupId === data.groupId && postId === data.postId) {
			res.write("event: create_subcomment_mutation\n");
			res.write(`data: ${JSON.stringify({ subcomment: data.subcomment, commentId: data.commentId })}\n\n`);
		}
	}

	const onDeleteCommentMutation = (data) => {
		if (groupId === data.groupId && postId === data.postId) {
			res.write("event: delete_comment_mutation\n");
			res.write(`data: ${JSON.stringify({ commentId: data.commentId })}\n\n`);
		}
	}

	const onDeleteSubcommentMutation = (data) => {
		if (groupId === data.groupId && postId === data.postId) {
			res.write("event: delete_subcomment_mutation\n");
			res.write(`data: ${JSON.stringify({ commentId: data.commentId, subcommentId: data.subcommentId })}\n\n`);
		}
	}

	const onLikeCommentMutation = (data) => {
		if (groupId === data.groupId && postId === data.postId) {
			res.write("event: like_comment_mutation\n");
			res.write(`data: ${JSON.stringify({ commentId: data.commentId, userId: data.userId })}\n\n`);
		}
	}

	const onUnlikeCommentMutation = (data) => {
		if (groupId === data.groupId && postId === data.postId) {
			res.write("event: unlike_comment_mutation\n");
			res.write(`data: ${JSON.stringify({ commentId: data.commentId, userId: data.userId })}\n\n`);
		}
	}

	const onLikeSubcommentMutation = (data) => {
		if (groupId === data.groupId && postId === data.postId) {
			res.write("event: like_subcomment_mutation\n");
			res.write(`data: ${JSON.stringify({ commentId: data.commentId, subcommentId: data.subcommentId,  userId: data.userId })}\n\n`);
		}
	}

	const onUnlikeSubcommentMutation = (data) => {
		if (groupId === data.groupId && postId === data.postId) {
			res.write("event: unlike_subcomment_mutation\n");
			res.write(`data: ${JSON.stringify({ commentId: data.commentId, subcommentId: data.subcommentId,  userId: data.userId })}\n\n`);
		}
	}

	const onLikePostMutation = (data) => {
		if (groupId === data.groupId && postId === data.postId) {
			res.write("event: like_post_mutation\n");
			res.write(`data: ${JSON.stringify({ userId: data.userId })}\n\n`);
		}
	}

	const onUnlikePostMutation = (data) => {
		if (groupId === data.groupId && postId === data.postId) {
			res.write("event: unlike_post_mutation\n");
			res.write(`data: ${JSON.stringify({ userId: data.userId })}\n\n`);
		}
	}

	eventEmitter.on('create_comment_mutation', onCreateCommentMutation);
	eventEmitter.on('create_subcomment_mutation', onCreateSubcommentMutation);
	eventEmitter.on('delete_comment_mutation', onDeleteCommentMutation);
	eventEmitter.on('delete_subcomment_mutation', onDeleteSubcommentMutation);
	eventEmitter.on('like_comment_mutation', onLikeCommentMutation);
	eventEmitter.on('unlike_comment_mutation', onUnlikeCommentMutation);
	eventEmitter.on('like_subcomment_mutation', onLikeSubcommentMutation);
	eventEmitter.on('unlike_subcomment_mutation', onUnlikeSubcommentMutation);
	eventEmitter.on('like_post_mutation', onLikePostMutation);
	eventEmitter.on('unlike_post_mutation', onUnlikePostMutation);

	req.on('close', () => {
		eventEmitter.removeListener('create_comment_mutation', onCreateCommentMutation);
		eventEmitter.removeListener('create_subcomment_mutation', onCreateSubcommentMutation);
		eventEmitter.removeListener('delete_comment_mutation', onDeleteCommentMutation);
		eventEmitter.removeListener('delete_subcomment_mutation', onDeleteSubcommentMutation);
		eventEmitter.removeListener('like_comment_mutation', onLikeCommentMutation);
		eventEmitter.removeListener('unlike_comment_mutation', onUnlikeCommentMutation);
		eventEmitter.removeListener('like_subcomment_mutation', onLikeSubcommentMutation);
		eventEmitter.removeListener('unlike_subcomment_mutation', onUnlikeSubcommentMutation);
		eventEmitter.removeListener('like_post_mutation', onLikePostMutation);
		eventEmitter.removeListener('unlike_post_mutation', onUnlikePostMutation);
	});
}

function newsfeedSse(req, res, eventEmitter) {
	const groupId = req.query.groupId;

	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive',
	});

	const onCreatePostMutation = (data) => {
		if (groupId === data.groupId) { //only send notif if event happened in our group
			res.write("event: create_post_mutation\n"); //must be named message
			res.write(`data: ${JSON.stringify({ post: data.post })}\n\n`); //"data" required for complete response
		}
	};

	const onDeletePostMutation = (data) => {
		if (groupId === data.groupId) { 
			res.write("event: delete_post_mutation\n"); 
			res.write(`data: ${data.postId}\n\n`); 
		}
	};

	const onStatMutation = (data) => { //either need to update numLikes or numComments for a newsfeed post
		if (groupId === data.groupId) { 
			res.write("event: stat_mutation\n"); 
			res.write(`data: ${data.postId}\n\n`); 
		}
	};

	eventEmitter.on('create_post_mutation', onCreatePostMutation);
	eventEmitter.on('delete_post_mutation', onDeletePostMutation);
	const statMutations = [
		'create_comment_mutation', 'create_subcomment_mutation', 'delete_comment_mutation', 
		'delete_subcomment_mutation', 'like_post_mutation', 'unlike_post_mutation'
	];
	statMutations.forEach((statMutation) => eventEmitter.on(statMutation, onStatMutation))

	req.on('close', () => {
		eventEmitter.removeListener('create_post_mutation', onCreatePostMutation); //how does this differ from removeAllListeners??
		eventEmitter.removeListener('delete_post_mutation', onDeletePostMutation);
		statMutations.forEach((statMutation) => eventEmitter.removeListener(statMutation, onStatMutation));
	});
}

module.exports = { expandedPostSse, newsfeedSse };