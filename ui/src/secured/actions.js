import fetch from 'isomorphic-fetch';

import graphQlFetch from './graphQlFetch.js';

export const FETCH_POSTS_REQUEST = 'FETCH_POSTS_REQUEST';
export function fetchPostsRequest() {
  return { type: FETCH_POSTS_REQUEST };
}

export const FETCH_POSTS_SUCCESS = 'FETCH_POSTS_SUCCESS';
export function fetchPostsSuccess(posts) {
  return { type: FETCH_POSTS_SUCCESS, posts };
}

export const FETCH_GROUP_MEMBERS_SUCCESS = 'FETCH_GROUP_MEMBERS_SUCCESS';
export function fetchGroupMembersSuccess(members) {
	return { type: FETCH_GROUP_MEMBERS_SUCCESS, members };
}

export const FETCH_POSTS_ERROR = 'FETCH_POSTS_ERROR';
export function fetchPostsError() {
  return { type: FETCH_POSTS_ERROR };
}

export const UPDATE_SINGLE_POST = 'UPDATE_SINGLE_POST';
export function updateSinglePost(post) {
	return { type: UPDATE_SINGLE_POST, post };
}

export const DELETE_SINGLE_POST = 'DELETE_SINGLE_POST';
export function deleteSinglePost(postId) {
	return { type: DELETE_SINGLE_POST, postId };
}

export const FETCH_POST_STATS_SUCCESS = 'FETCH_POST_STATS_SUCCESS';
export function fetchPostStatsSuccess(post) {
	return { type: FETCH_POST_STATS_SUCCESS, post }
}

export const UPDATE_USER_INFO = 'UPDATE_USER_INFO';
export function updateUserInfo(name, email) {
	return { type: UPDATE_USER_INFO, name, email };
}

export const FETCH_USER_INFO_REQUEST = 'FETCH_USER_INFO_REQUEST';
export function fetchUserInfoRequest() {
	return { type: FETCH_USER_INFO_REQUEST };
}

export const FETCH_USER_INFO_SUCCESS = 'FETCH_USER_INFO_SUCCESS';
export function fetchUserInfoSuccess(groups, _id, avatarHash) {
	return { type: FETCH_USER_INFO_SUCCESS, groups, _id, avatarHash };
}

export const UPDATE_ACTIVE_GROUP_ID = 'UPDATE_ACTIVE_GROUP_ID';
export function updateActiveGroupId(groupId) {
	return { type: UPDATE_ACTIVE_GROUP_ID, groupId };
}

export const SET_TOAST_MESSAGE = 'SET_TOAST_MESSAGE';
export function setToastMessage(msg, time) {
	return { type: SET_TOAST_MESSAGE, msg, time };
}

export const CLEAR_TOAST_MESSAGE = 'CLEAR_TOAST_MESSAGE';
export function clearToastMessage() {
	return { type: CLEAR_TOAST_MESSAGE };
}

/* fetch posts and members from a specific group */
export function fetchGroupPosts(userId, groupId, index) {
	return async function(dispatch) {
		let query = `query groupPosts($userId: ID!, $groupId: ID!, $index: Int) {
  			groupPosts(userId: $userId, groupId: $groupId, index: $index) {
        		_id timestamp text numLikes userLiked numComments index
        		author {
        			_id name avatarHash
        		}
  			}
		}`;
		let data = await graphQlFetch(query, { userId, groupId, index });
		if (data && data.groupPosts) {
			dispatch(fetchPostsSuccess(data.groupPosts));
		} else {
			dispatch(fetchPostsError());
		}

		query = `query groupMembers($groupId: ID!) {
			groupMembers(groupId: $groupId) {
	    		_id name avatarHash
			}
		}`;
		data = await graphQlFetch(query, { groupId });
		if (data && data.groupMembers) {
			dispatch(fetchGroupMembersSuccess(data.groupMembers));
		}
	}
}

/* fetch a user's groups, avatar hash, and id */
export function fetchUserInfo(email) {
	return async function(dispatch) {
		dispatch(fetchUserInfoRequest());
		const query = `query userInfo($email: String!) {
  			userInfo(email: $email) {
        		groups {
        			_id name
        		}
        		avatarHash
        		_id
  			}
		}`;
		const data = await graphQlFetch(query, { email });
		if (data) {
			dispatch(fetchUserInfoSuccess(data.userInfo.groups, data.userInfo._id, data.userInfo.avatarHash));
		}
	}
}

export function createPost(text, authorId, groupId) {
	return async function(dispatch) {
		const mutation = `mutation createPost($groupId: ID!, $post: PostInput!) {
	  		createPost(groupId: $groupId, post: $post)  
		}`;
		const post = { authorId, text };
		let data = await graphQlFetch(mutation, { groupId, post });
		if (data && data.createPost) {
			dispatch(setToastMessage('Post submitted successfully', Date.now()));
		} else {
			dispatch(setToastMessage('Error submitting post', Date.now()));
		}
	}
}

export function createComment(text, authorId, groupId, postId) {
	return async function(dispatch) {
		const mutation = `mutation createComment($groupId: ID!, $postId: ID!, $comment: PostInput!) {
	  		createComment(groupId: $groupId, postId: $postId, comment: $comment)  
		}`;
		const comment = { authorId, text };
		let data = await graphQlFetch(mutation, { groupId, postId, comment });
		if (data && data.createComment) {
			dispatch(setToastMessage('Comment submitted successfully', Date.now()));
		} else {
			dispatch(setToastMessage('Error submitting comment', Date.now()));
		}
	}
}

export function createSubcomment(text, authorId, groupId, postId, commentId) {
	return async function(dispatch) {
		const mutation = `mutation createSubcomment($groupId: ID!, $postId: ID!, $commentId: ID!, $subcomment: PostInput!) {
	  		createSubcomment(groupId: $groupId, postId: $postId, commentId: $commentId, subcomment: $subcomment)  
		}`;
		const subcomment = { authorId, text };
		let data = await graphQlFetch(mutation, { groupId, postId, commentId, subcomment });
		if (data && data.createSubcomment) {
			dispatch(setToastMessage('Reply submitted successfully', Date.now()));
		} else {
			dispatch(setToastMessage('Error submitting reply', Date.now()));
		}
	}
}

export function deletePost(groupId, postId) {
	return async function(dispatch) {
		const mutation = `mutation deletePost($groupId: ID!, $postId: ID!) {
		  deletePost(groupId: $groupId, postId: $postId) 
		}`;
		let data = await graphQlFetch(mutation, { groupId, postId });
		if (data && data.deletePost) {
			dispatch(setToastMessage('Post deleted successfully', Date.now()));
		} else {
			dispatch(setToastMessage('Error deleting post', Date.now()));
		}
	}
}

export function deleteComment(groupId, postId, commentId) {
	return async function(dispatch) {
		const mutation = `mutation deleteComment($groupId: ID!, $postId: ID!, $commentId: ID!) {
		  deleteComment(groupId: $groupId, postId: $postId, commentId: $commentId) 
		}`;
		let data = await graphQlFetch(mutation, { groupId, postId, commentId });
		if (data && data.deleteComment) {
			dispatch(setToastMessage('Comment deleted successfully', Date.now()));
		} else {
			dispatch(setToastMessage('Error deleting comment', Date.now()));
		}
	}
}

export function deleteSubcomment(groupId, postId, commentId, subcommentId) {
	return async function(dispatch) {
		const mutation = `mutation deleteSubcomment($groupId: ID!, $postId: ID!, $commentId: ID!, $subcommentId:ID!) {
		  deleteSubcomment(groupId: $groupId, postId: $postId, commentId: $commentId, subcommentId: $subcommentId) 
		}`;
		let data = await graphQlFetch(mutation, { groupId, postId, commentId, subcommentId });
		if (data && data.deleteSubcomment) {
			dispatch(setToastMessage('Comment deleted successfully', Date.now()));
		} else {
			dispatch(setToastMessage('Error deleting comment', Date.now()));
		}
	}
}

export function likePost(userId, groupId, postId) {
	return async function(dispatch) {
		const mutation = `mutation likePost($userId: ID!, $groupId: ID!, $postId: ID!) {
	  		likePost(userId: $userId, groupId: $groupId, postId: $postId) 
		}`;
		let data = await graphQlFetch(mutation, { userId, groupId, postId });
	}
}

export function unlikePost(userId, groupId, postId) {
	return async function(dispatch) {
		const mutation = `mutation unlikePost($userId: ID!, $groupId: ID!, $postId: ID!) {
	  		unlikePost(userId: $userId, groupId: $groupId, postId: $postId) 
		}`;
		let data = await graphQlFetch(mutation, { userId, groupId, postId });
	}
}

export function likeComment(userId, groupId, postId, commentId) {
	return async function(dispatch) {
		const mutation = `mutation likeComment($userId: ID!, $groupId: ID!, $postId: ID!, $commentId: ID!) {
	  		likeComment(userId: $userId, groupId: $groupId, postId: $postId, commentId: $commentId) 
		}`;
		let data = await graphQlFetch(mutation, { userId, groupId, postId, commentId });
	}
}

export function unlikeComment(userId, groupId, postId, commentId) {
	return async function(dispatch) {
		const mutation = `mutation unlikeComment($userId: ID!, $groupId: ID!, $postId: ID!, $commentId: ID!) {
	  		unlikeComment(userId: $userId, groupId: $groupId, postId: $postId, commentId: $commentId) 
		}`;
		let data = await graphQlFetch(mutation, { userId, groupId, postId, commentId });
	}
}

export function likeSubcomment(userId, groupId, postId, commentId, subcommentId) {
	return async function(dispatch) {
		const mutation = `mutation likeSubcomment($userId: ID!, $groupId: ID!, $postId: ID!, $commentId: ID!, $subcommentId: ID!) {
	  		likeSubcomment(userId: $userId, groupId: $groupId, postId: $postId, commentId: $commentId, subcommentId: $subcommentId) 
		}`;
		let data = await graphQlFetch(mutation, { userId, groupId, postId, commentId, subcommentId });
	}
}

export function unlikeSubcomment(userId, groupId, postId, commentId, subcommentId) {
	return async function(dispatch) {
		const mutation = `mutation unlikeSubcomment($userId: ID!, $groupId: ID!, $postId: ID!, $commentId: ID!, $subcommentId: ID!) {
	  		unlikeSubcomment(userId: $userId, groupId: $groupId, postId: $postId, commentId: $commentId, subcommentId: $subcommentId) 
		}`;
		let data = await graphQlFetch(mutation, { userId, groupId, postId, commentId, subcommentId });
	}
}

export function fetchPostStats(userId, groupId, postId) {
	return async function(dispatch) {
		const mutation = `query singlePostStats($userId: ID!, $groupId: ID!, $postId: ID!) {
	  		singlePostStats(userId: $userId, groupId: $groupId, postId: $postId) {
	  			_id numLikes userLiked numComments
	  		}
		}`;
		let data = await graphQlFetch(mutation, { userId, groupId, postId });
		if (data && data.singlePostStats) {
			dispatch(fetchPostStatsSuccess(data.singlePostStats));
		}
	}
}

