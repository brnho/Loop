import React from 'react';
import { Route, Switch } from 'react-router-dom';

import NavBar from './NavBar.jsx';
import Auth from './Auth.jsx';
import Home from './Home.jsx';

export default class Page extends React.Component {
	render() {
		return (
			<React.Fragment>
				<NavBar />
				<Switch>
					<Route path='/auth' component={Auth} />
					<Route component={Home} />
				</Switch>
			</React.Fragment>
		);
	}
}