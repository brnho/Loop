import { connect } from 'react-redux';
import { 
	fetchGroupPosts, updateActiveGroupId, likePost, unlikePost, 
	fetchPostStats, updateSinglePost, deleteSinglePost 
} from '../actions.js';

import NewsFeed from '../NewsFeed.jsx';

function mapStateToProps(state) {
	return {
		posts: state.posts.posts,
		postIndex: state.posts.postIndex,
		isFetching: state.posts.isFetching,
		error: state.posts.error,
		avatarHash: state.user.avatarHash,
		name: state.user.name,
		userId: state.user._id,
		groupId: state.user.activeGroupId,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		fetchGroupPosts: (userId, groupId, index) => dispatch(fetchGroupPosts(userId, groupId, index)),
		updateActiveGroupId: (_id) => dispatch(updateActiveGroupId(_id)),
		likePost: (userId, groupId, postId) => dispatch(likePost(userId, groupId, postId)),
		unlikePost: (userId, groupId, postId) => dispatch(unlikePost(userId, groupId, postId)),
		fetchPostStats: (userId, groupId, postId) => dispatch(fetchPostStats(userId, groupId, postId)),
		updateSinglePost: (post) => dispatch(updateSinglePost(post)),
		deleteSinglePost: (postId) => dispatch(deleteSinglePost(postId))
	}
}

const NewsFeedContainer = connect(mapStateToProps, mapDispatchToProps)(NewsFeed);

export default NewsFeedContainer;