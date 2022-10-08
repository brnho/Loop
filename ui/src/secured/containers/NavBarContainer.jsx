import { connect } from 'react-redux';

import NavBar from '../NavBar.jsx';
import { fetchGroupPosts, updateActiveGroupId } from '../actions.js';

function mapStateToProps(state) {
	return {
		name: state.user.name,
		userId: state.user._id,
		groups: state.user.groups,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		fetchGroupPosts: (userId, groupId) => dispatch(fetchGroupPosts(userId, groupId)),
		updateActiveGroupId: (groupId) => dispatch(updateActiveGroupId(groupId)),
	}
}

const NavBarContainer = connect(mapStateToProps, mapDispatchToProps)(NavBar);

export default NavBarContainer;