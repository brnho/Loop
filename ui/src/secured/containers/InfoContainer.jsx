import { connect } from 'react-redux';

import Info from '../Info.jsx';

function mapStateToProps(state) {
	return {
		members: state.posts.members,
	}
}

const InfoContainer = connect(mapStateToProps, null)(Info);

export default InfoContainer;