import { connect } from 'react-redux';

import ChatTab from '../ChatTab.jsx';

function mapStateToProps(state) {
	return {
		members: state.posts.members,
	}
}

const ChatTabContainer = connect(mapStateToProps, null)(ChatTab);

export default ChatTabContainer;