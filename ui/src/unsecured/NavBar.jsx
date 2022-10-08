import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';

import '../css/NavBar.css';

export default function NavBar() {
	return (
		<Navbar fixed="top" variant="dark" bg="dark">
			<Navbar.Brand><Link to="/" className="loop_link">Loop</Link></Navbar.Brand>
			<Navbar.Collapse className="justify-content-end">
				<Link to="/auth/sign_up" className="loop_link">
						<Button variant="outline-info" data-cy="sign-up">Sign up</Button>
				</Link>	
				<Link to="/auth/sign_in" className="loop_link">
						<Button variant="outline-info" data-cy="sign-in">Sign in</Button>
				</Link>
			</Navbar.Collapse>
		</Navbar>
	);
}
