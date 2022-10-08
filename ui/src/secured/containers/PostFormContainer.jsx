import { connect } from 'react-redux';
import { createPost } from '../actions.js';

import PostForm from '../PostForm.jsx';

function mapStateToProps(state) {
	return {
		name: state.user.name,
		avatarHash: state.user.avatarHash,
		authorId: state.user._id,
		groupId: state.user.activeGroupId, 
	}
}

function mapDispatchToProps(dispatch) {
	return {
		createPost: (text, authorId, groupId) => dispatch(createPost(text, authorId, groupId)),
	}
}

const PostFormContainer = connect(mapStateToProps, mapDispatchToProps)(PostForm);

export default PostFormContainer;