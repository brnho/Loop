import { connect } from 'react-redux';

import { deleteComment } from '../actions.js';
import OptionsIcon from '../OptionsIcon.jsx';

function mapStateToProps(state) {
	return {
		userId: state.user._id,
		groupId: state.user.activeGroupId,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		delete: (groupId, postId, commentId) => dispatch(deleteComment(groupId, postId, commentId)),
	}
}

const CommentOptionsIconContainer = connect(mapStateToProps, mapDispatchToProps)(OptionsIcon);

export default CommentOptionsIconContainer;