import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';

import NewsFeedContainer from './containers/NewsFeedContainer.jsx';
import NavBarContainer from './containers/NavBarContainer.jsx';
import ToastContainer from './containers/ToastContainer.jsx';
import graphQlFetch from './graphQlFetch.js';

class Page extends React.Component {
	componentDidMount() {
		const { name, email } = window.__INITIAL_DATA__;
		this.props.updateUserInfo(name, email);
		this.props.fetchUserInfo(email); //you can setTimeout here to test props.userId updating in <NewsFeed>
	}

	componentDidUpdate(prevProps) {
		if (prevProps.isFetching && !this.props.isFetching) { //on refresh or initial page load
			//handle case when user has no groups - render create group option

			const params = new URLSearchParams(this.props.location.search);
			const groupId = params.get('groupId');
			if (!groupId) { 
				this.props.updateActiveGroupId(this.props.groups[0]._id); //default option (first group)
			} else {
				this.props.updateActiveGroupId(groupId); 
			}
		}

		if (prevProps.activeGroupId !== this.props.activeGroupId) { //user changed groups
			this.props.history.push({ search: `?groupId=${this.props.activeGroupId}` });
		}
	}

	hideToast = () => {
		this.props.clearToastMessage();
  	} 

	render() {
		if (this.props.isFetching) {
			return null;
		}
		return (
			<React.Fragment>
				<NavBarContainer />
				<Switch>
					<Route component={NewsFeedContainer} />
				</Switch>
				<ToastContainer />
			</React.Fragment>
		);
	}
}

Page.propTypes = {
	updateUserInfo: PropTypes.func,
	fetchUserInfo: PropTypes.func,
	clearToastMessage: PropTypes.func,
	updateActiveGroupId: PropTypes.func,
	
	isFetching: PropTypes.bool,
	groups: PropTypes.arrayOf(PropTypes.object),
	activeGroupId: PropTypes.string,
	toastMsg: PropTypes.string,
};

export default withRouter(Page);