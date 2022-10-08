import { connect } from 'react-redux';

import { clearToastMessage } from '../actions.js';
import Toast from '../Toast.jsx';

function mapStateToProps(state) {
	return {
		toastMsg: state.posts.toastMsg,
		toastTime: state.posts.toastTime,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		clearToastMessage: () => dispatch(clearToastMessage),
	}
}

const ToastContainer = connect(mapStateToProps, mapDispatchToProps)(Toast);

export default ToastContainer;