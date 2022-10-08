require('dotenv').config();
const fs = require('fs');
const { ApolloServer } = require('apollo-server-express');

const GraphQLDate = require('./graphql_date.js');
const { 
	userInfo, groupPosts, groupMembers, singlePost_post, 
	singlePost_comments, singlePost_subcomments, singlePostStats, getPostLikes, getConvoId 
} = require('./queryResolvers.js');
const { 
	createPost, createComment, createSubcomment, deletePost, 
	deleteComment, deleteSubcomment, likePost, unlikePost, likeComment,
	unlikeComment, likeSubcomment, unlikeSubcomment, 
} = require('./mutationResolvers.js');

const resolvers = {
	Query: {
		singlePost_post,
		singlePost_comments,
		singlePost_subcomments,
		singlePostStats,
		userInfo,
		groupPosts,
		groupMembers,
		getPostLikes,
		getConvoId,
	},
	Mutation: {
		createPost,
		createComment,
		createSubcomment,
		deletePost,
		deleteComment,
		deleteSubcomment,
		likePost,
		unlikePost,
		likeComment,
		unlikeComment,
		likeSubcomment,
		unlikeSubcomment,
	},
	GraphQLDate,
};

function getContext({ req }) {
	return { req };
}

const server = new ApolloServer({
	typeDefs: fs.readFileSync('schema.graphql', 'utf-8'),
	resolvers,
	context: getContext,
});

function installHandler(app) {
	const enableCors = process.env.ENABLE_CORS;
	console.log('CORS setting:', enableCors);
	let cors;
	if (enableCors) {
		const origin = process.env.UI_SERVER_ORIGIN;
		const methods = 'POST';
		cors = { origin, methods, credentials: true };
	} else {
		cors = 'false';
	}
	server.applyMiddleware({ app, path: '/graphql', cors });
}

module.exports = { installHandler };