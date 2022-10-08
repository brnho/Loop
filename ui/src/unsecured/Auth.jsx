import React from 'react';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import { Switch, Route, withRouter } from 'react-router-dom';

import SignUpForm from './SignUpForm.jsx';
import SignInForm from './SignInForm.jsx';
import NumForm from './NumForm.jsx';

class Auth extends React.Component {
	render() {
		const { match: { path } } = this.props;
		return (
			<Container fluid={true}>
				<Col md={{ span: 4, offset: 4 }}>
						<Route exact path={`${path}/confirm_email`} component={NumForm} />
						<Route exact path={`${path}/sign_up`} component={SignUpForm} />
						<Route exact path={`${path}/sign_in`} component={SignInForm} />
				</Col>
			</Container>
		);
	}
}

export default withRouter(Auth);
