import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { Redirect } from 'react-router-dom';

export default class NumForm extends React.Component {
	state = {
		num: '',
		email: '',
		error: '',
		disabled: true,
		redirect: false,
	}

	componentDidMount() {
		if (this.props.location.state) { //SignUpForm rendered a redirect to get us here
			const email = this.props.location.state.email;
			this.setState({ email });
		} else {
			this.setState({ redirect: true });
		}
	}

	onChange = (e) => {
		const num = e.target.value;
		if (num.match(/^\d*$/)) {
			let disabled;
			if (num.length < 6) {
				disabled = true;
			} else {
				disabled = false;
			}
			this.setState({ num, disabled });
		}
	}

	onSubmit = async (e) => {
		e.preventDefault();
		this.setState({ disabled: true });
		const apiEndpoint = window.ENV.UI_API_AUTH_ENDPOINT;
		try {
			const num = this.state.num
			const response = await fetch(`${apiEndpoint}/verify`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }, //required for JSON payload to be parsed
				body: JSON.stringify({ num }),
				credentials: 'include',
			});
			if (response.status === 200) {
				window.location.href = window.ENV.UI_SERVER_ORIGIN; 
			} else if (response.status === 404) {
				this.setState({ disabled: false, error: 'Missing cookie, please try signing up again.' });
			} else if (response.status === 403) {
				this.setState({ disabled: false, error: 'Incorrect number. Please try again.' });
			} else {
				this.setState({ error: "Sorry, we've encountered an unexpected error. Please try signing up again." });
			}
		} catch (error) {
			this.setState({ error: "Sorry, we've encountered an unexpected error. Please try signing up again." });
		}	
	}

	render() {
		if (this.state.redirect) {
			return (<Redirect to={'/auth/sign_up'} />);
		}
		return (
			<React.Fragment>
				<h2>Check your email!</h2>
				<br />
				<div>We've sent a 6-digit confirmation code to {this.state.email}.</div>
				<div>It will expire shortly, so enter it soon.</div>
				<br />
				<Form onSubmit={this.onSubmit}>
					<Form.Group>
						<Form.Control 
							placeholder="6-digit number" type="text" maxLength={6} 
							onChange={this.onChange} value={this.state.num} 
						/>
						<Form.Text className="text-muted">
				    		Remember to try your spam folder!
			    		</Form.Text>
					</Form.Group>
					<Alert variant="danger" show={this.state.error ? true : false}>{this.state.error}</Alert>
					<Button variant="primary" type="submit" disabled={this.state.disabled}>Submit</Button>
				</Form>
			</React.Fragment>
		);
	}
}
