import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import validator from 'email-validator';
import passwordValidator from 'password-validator';
import { Redirect, withRouter } from 'react-router-dom';

const schema = new passwordValidator();
schema
.is().min(8)
.is().max(20)
.has().uppercase()
.has().not().spaces();

class SignUpForm extends React.Component {
	state = {
		email: '',
		name: '',
		password: '',
		emailError: '',
		passwordError: '',
		error: '',
		disabled: true,
		fetching: false,
		redirect: false,
	};

	validate = () => {
		if (validator.validate(this.state.email) && schema.validate(this.state.password) && this.state.name) {
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

	onPasswordBlur = () => {
		if (!schema.validate(this.state.password)) {
			this.setState({ passwordError: 'Invalid password' });
		} else {
			this.setState({ passwordError: '' });
		}
	}

	onPasswordFocus = () => {
		this.setState({ passwordError: '' });
	}

	handleSubmit = async (e) => {
		e.preventDefault();
		const { email, name, password } = this.state;
		this.setState({ fetching: true });
		try {
			const apiEndpoint = window.ENV.UI_API_AUTH_ENDPOINT;
			const response = await fetch(`${apiEndpoint}/signup`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, name, password }),
			});
			if (response.status === 200) {
				this.setState({ redirect: true });
			} else if (response.status === 404) {
				this.setState({ error: 'Please fill out all fields.', fetching: false });
			} else if (response.status === 409) {
				this.setState({ error: 'Sorry, that email has already been taken.', fetching: false });
			} else {
				this.setState({ error: "Sorry, we've encountered an unexpected error. Please try signing up again.", fetching: false });
			}
		} catch(e) {
			this.setState({ error: "Sorry, we've encountered an unexpected error. Please try signing up again.", fetching: false });
		}
	}

	render() {
		const { email, name, password, disabled, emailError, passwordError, error, fetching, redirect } = this.state;
		if (redirect) {
			return (<Redirect to={{
					pathname: `/auth/confirm_email`, 
					state: { email },
				}} 
			/>);
		}
		let submit;
		if (fetching) {
			submit = <Spinner animation="border" role="status"><span className="sr-only">Loading...</span></Spinner>;
		} else {
			submit = <Button variant="primary" type="submit" onClick={this.handleSubmit} disabled={disabled}>
	    				Submit
	  				</Button>;
		}
		return (
			<React.Fragment>
				<h2>Sign up</h2>
				<hr />
				<Form>
					<Form.Group>
					    <Form.Label>Email address</Form.Label>
					    <Form.Control 
					    	type="email" name="email" placeholder="Enter email" value={email} 
					    	onBlur={this.onEmailBlur} onFocus={this.onEmailFocus} onChange={this.onInputChange}
				    	/>
				    	<Form.Text style={{color: "red"}}>{emailError}</Form.Text>
				  	</Form.Group>

				  	<Form.Group>
					    <Form.Label>Name</Form.Label>
					    <Form.Control type="text" name="name" placeholder="Enter name" value={name} onChange={this.onInputChange}/>
				  	</Form.Group>

				  	<Form.Group controlId="formBasicPassword">
				    	<Form.Label>Password</Form.Label>
					    <Form.Control 
					    	type="password" name="password" placeholder="Password" value={password} 
					    	onBlur={this.onPasswordBlur} onFocus={this.onPasswordFocus} onChange={this.onInputChange}
				    	/>
				    	<Form.Text className="text-muted">
				    		Password requirements: >8 characters, at least 1 uppercase character, no spaces
			    		</Form.Text>
				    	<Form.Text style={{color: "red"}}>{passwordError}</Form.Text>
				  	</Form.Group>
            		<Alert variant="danger" show={error ? true : false}>{error}</Alert>
				  	{submit}
			  	</Form>
		  	</React.Fragment>
		);
	}
}

export default withRouter(SignUpForm);