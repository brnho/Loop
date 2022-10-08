import { combineReducers } from 'redux';
import { 
	FETCH_POSTS_REQUEST,
	FETCH_POSTS_SUCCESS,
	FETCH_POSTS_ERROR,
	FETCH_GROUP_MEMBERS_SUCCESS,
	UPDATE_SINGLE_POST,
	DELETE_SINGLE_POST,
	FETCH_POST_STATS_SUCCESS,
	UPDATE_USER_INFO,
	FETCH_USER_INFO_REQUEST,
	FETCH_USER_INFO_SUCCESS,
	UPDATE_ACTIVE_GROUP_ID,
	SET_TOAST_MESSAGE,
	CLEAR_TOAST_MESSAGE,
} from './actions.js';

/*
post: {
	_id: null,
	author: {
		_id: null,
		name: null,
		avatarHash: null,
	},
	index: null,
	timestamp: null,
	text: null,
	numLikes: null,
	userLiked: null,
	numComments: null,
}
*/

const initialPostsState = {
	isFetching: true,
	error: false,
	posts: [],
	postIndex: null,
	toastMsg: null,
	toastTime: null,
	members: [],
};

const initialUserState = {
	isFetching: true, //fetching groups
	name: null,
	email: null,
	_id: null,
	avatarHash: null,
	activeGroupId: null, //id of active group
	groups: [
		{
			_id: null,
			name: null,
		},
	],
};

function userReducer(state = initialUserState, action) {
	switch (action.type) {
		case UPDATE_USER_INFO:
			return Object.assign({}, state, { name: action.name, email: action.email });
		case FETCH_USER_INFO_REQUEST:
			return Object.assign({}, state, { isFetching: true });
		case FETCH_USER_INFO_SUCCESS:
			return Object.assign({}, state, { 
				isFetching: false, groups: action.groups, _id: action._id, avatarHash: action.avatarHash, 
			});
		case UPDATE_ACTIVE_GROUP_ID:
			return Object.assign({}, state, { activeGroupId: action.groupId });
		default:
			return state;
	}
}

function postsReducer(state = initialPostsState, action) {
	switch (action.type) {
		case FETCH_POSTS_REQUEST:
			return Object.assign({}, state, { isFetching: true });
		case FETCH_POSTS_SUCCESS: {
			const posts = state.posts.concat(action.posts);
			const postIndex = action.posts.length === parseInt(window.ENV.POST_LIMIT) ? posts[posts.length-1].index : -1;
			return Object.assign({}, state, { postIndex, posts, isFetching: false });
		}
		case FETCH_POSTS_ERROR:
			return Object.assign({}, state, { error: true });
		case FETCH_GROUP_MEMBERS_SUCCESS:
			return Object.assign({}, state, { members: action.members });
		case UPDATE_SINGLE_POST:
			const posts = [action.post, ...state.posts];
			return Object.assign({}, state, { posts });
		case DELETE_SINGLE_POST: {
			const posts = state.posts.filter((post) => post._id !== action.postId);
			return Object.assign({}, state, { posts });
		}
		case FETCH_POST_STATS_SUCCESS:
			const updatedPosts = state.posts.map((post) => {
				if (post._id === action.post._id) {
					return Object.assign({}, post, action.post);
				} else {
					return post;
				}
			}); //is this even performant
			return Object.assign({}, state, { posts: updatedPosts });
		case SET_TOAST_MESSAGE:
			return Object.assign({}, state, { toastMsg: action.msg, toastTime: action.time });
		case CLEAR_TOAST_MESSAGE:
			return Object.assign({}, state, { toastMsg: null });
		default:
			return state;
	}
}

const reducer = combineReducers({ 
	user: userReducer, //userReducer is passed user.events
	posts: postsReducer,
});

export default reducer;


