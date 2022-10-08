import { connect } from 'react-redux';
import { updateUserInfo, fetchUserInfo, clearToastMessage, updateActiveGroupId } from '../actions.js';

import Page from '../Page.jsx';

function mapDispatchToProps(dispatch) {
	return {
		updateUserInfo: (name, email) => dispatch(updateUserInfo(name, email )),
		fetchUserInfo: (email) => dispatch(fetchUserInfo(email)),
		clearToastMessage: () => dispatch(clearToastMessage()),
		updateActiveGroupId: (groupId) => dispatch(updateActiveGroupId(groupId)),
	}
}

function mapStateToProps(state) {
	return {
		toastMsg: state.posts.toastMsg,
		isFetching: state.user.isFetching,
		groups: state.user.groups,
		activeGroupId: state.user.activeGroupId,
	}
}

const PageContainer = connect(mapStateToProps, mapDispatchToProps)(Page);

export default PageContainer;