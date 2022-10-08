import React from 'react';
import PropTypes from 'prop-types';

import '../css/Toast.css';

export default class Toast extends React.Component {
	state = {
		style: { display: 'none' },
		class: '',
	}

	componentDidMount() {
		if (this.props.toastMsg)
		{
			this.setState({ style: { display: 'block' }, class: 'toastFade' });
			this.timer = setTimeout(() => {
				this.setState({ style: { display: 'none' }, class: '' });
				this.props.clearToastMessage();
			}, 4000);
		}
	}

	componentWillUnmount() {
		clearTimeout(this.timer);
		clearTimeout(this.timer1);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.toastTime !== this.props.toastTime) {
			this.timer ? clearTimeout(this.timer) : null;
			this.setState({ class: '' }, () => {
				this.timer1 = setTimeout(() => { 
					this.setState({ style: { display: 'block' }, class: 'toastFade' });
				}, 100);
			});
			this.timer = setTimeout(() => {
				this.setState({ style: { display: 'none' }, class: '' });
				this.props.clearToastMessage();
			}, 4000);
		}
	}

	render() {
		return (
			<div style={this.state.style} className={`toastMsg ${this.state.class}`}>{this.props.toastMsg}</div>
		);
	}
}

Toast.propTypes = {
	clearToastMessage: PropTypes.func,
	toastMsg: PropTypes.string,
	toastTime: PropTypes.number,
};