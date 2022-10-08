import { connect } from 'react-redux';

import ChatWindow from '../ChatWindow.jsx';

function mapStateToProps(state) {
	return {
		name: state.user.name,
		userId: state.user._id,
		avatarHash: state.user.avatarHash
	}
}

const ChatWindowContainer = connect(mapStateToProps, null)(ChatWindow);

export default ChatWindowContainer;