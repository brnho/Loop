import { connect } from 'react-redux';

import { deleteSubcomment } from '../actions.js';
import OptionsIcon from '../OptionsIcon.jsx';

function mapStateToProps(state) {
	return {
		userId: state.user._id,
		groupId: state.user.activeGroupId,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		delete: (groupId, postId, commentId, subcommentId) => dispatch(deleteSubcomment(groupId, postId, commentId, subcommentId)),
	}
}

const SubcommentOptionsIconContainer = connect(mapStateToProps, mapDispatchToProps)(OptionsIcon);

export default SubcommentOptionsIconContainer;