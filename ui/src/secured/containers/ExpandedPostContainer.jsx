import { connect } from 'react-redux';
import { 
	createComment, createSubcomment, likePost, unlikePost, 
	likeComment, unlikeComment, likeSubcomment, unlikeSubcomment 
} from '../actions.js';

import ExpandedPost from '../ExpandedPost.jsx';

function mapStateToProps(state) {
	return {
		name: state.user.name,
		avatarHash: state.user.avatarHash,
		userId: state.user._id,
		groupId: state.user.activeGroupId, 
	}
}

function mapDispatchToProps(dispatch) {
	return {
		createComment: (text, authorId, groupId, postId) => dispatch(createComment(text, authorId, groupId, postId)),
		createSubcomment: (text, authorId, groupId, postId, commentId) => 
			dispatch(createSubcomment(text, authorId, groupId, postId, commentId)),
		likePost: (userId, groupId, postId) => dispatch(likePost(userId, groupId, postId)),
		unlikePost: (userId, groupId, postId) => dispatch(unlikePost(userId, groupId, postId)),
		likeComment: (userId, groupId, postId, commentId) => dispatch(likeComment(userId, groupId, postId, commentId)),
		unlikeComment: (userId, groupId, postId, commentId) => dispatch(unlikeComment(userId, groupId, postId, commentId)),
		likeSubcomment: (userId, groupId, postId, commentId, subcommentId) => 
			dispatch(likeSubcomment(userId, groupId, postId, commentId, subcommentId)),
		unlikeSubcomment: (userId, groupId, postId, commentId, subcommentId) => 
			dispatch(unlikeSubcomment(userId, groupId, postId, commentId, subcommentId)),
	}
}

const ExpandedPostContainer = connect(mapStateToProps, mapDispatchToProps)(ExpandedPost);

export default ExpandedPostContainer;