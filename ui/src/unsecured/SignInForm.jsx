import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import validator from 'email-validator';
import { Redirect } from 'react-router-dom';

class SignInForm extends React.Component {
	state = {
		email: '',
		emailError: '',
		password: '',
		error: '',
		disabled: true,
		fetching: false,
	};

	validate = () => {
		if (validator.validate(this.state.email) && this.state.password) {
			this.setState({ disabled: false });
		} else {
			this.setState({ disabled: true });
		}
	}

	onInputChange = (e) => {
		const obj = {};
		obj[e.target.name] = e.target.value;
		this.setState(obj, () => this.validate()); //validate only after state has updated 
	}

	onEmailBlur = () => {
		if (!validator.validate(this.state.email)) {
			this.setState({ emailError: 'Invalid email' });
		} else {
			this.setState({ emailError: '' });
		}
	}

	onEmailFocus = () => {
		this.setState({ emailError: '' });
	}

	handleSubmit = async (e) => {
		e.preventDefault();
		const { email, name, password } = this.state;
		this.setState({ fetching: true });
		try {
			const apiEndpoint = window.ENV.UI_API_AUTH_ENDPOINT;
			const response = await fetch(`${apiEndpoint}/signin`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, name, password }),
			});
			if (response.status === 200) {
				window.location.href = window.ENV.UI_SERVER_ORIGIN; 
			} else if (response.status === 401) {
				const body = await response.text();
				const result = JSON.parse(body);
				this.setState({ error: result.message, fetching: false });
			}
		} catch(e) {
			this.setState({ error: "Sorry, we've encountered an unexpected error. Please try logging up again.", fetching: false });
		} 
	}

	render() {
		const { email, emailError, password, disabled, error, fetching } = this.state;
		let submit;
		if (fetching) {
			submit = <Spinner animation="border" role="status"><span className="sr-only">Loading...</span></Spinner>;
		} else {
			submit = <Button variant="primary" type="submit" onClick={this.handleSubmit} disabled={disabled} data-cy="submit">
	    				Submit
	  				</Button>;
		}
		return (
			<React.Fragment>
				<h2>Sign In</h2>
				<hr />
				<Form>
					<Form.Group>
					    <Form.Label>Email address</Form.Label>
					    <Form.Control 
					    	type="email" name="email" placeholder="Enter email" value={email} data-cy="email"
					    	onBlur={this.onEmailBlur} onFocus={this.onEmailFocus} onChange={this.onInputChange}
				    	/>
				    	<Form.Text style={{color: "red"}}>{emailError}</Form.Text>
				  	</Form.Group>

				  	<Form.Group controlId="formBasicPassword">
				    	<Form.Label>Password</Form.Label>
					    <Form.Control 
					    	type="password" name="password" placeholder="Password" value={password} 
							onChange={this.onInputChange} data-cy="password"
				    	/>
				  	</Form.Group>
            		<Alert variant="danger" show={error ? true : false}>{error}</Alert>
				  	{submit}
			  	</Form>
		  	</React.Fragment>
		);
	}
}

export default SignInForm;