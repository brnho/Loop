import { connect } from 'react-redux';

import { deletePost } from '../actions.js';
import OptionsIcon from '../OptionsIcon.jsx';

function mapStateToProps(state) {
	return {
		userId: state.user._id,
		groupId: state.user.activeGroupId,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		delete: (groupId, postId) => dispatch(deletePost(groupId, postId)),
	}
}

const PostOptionsIconContainer = connect(mapStateToProps, mapDispatchToProps)(OptionsIcon);

export default PostOptionsIconContainer;