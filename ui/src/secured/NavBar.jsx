import React from 'react';
import ReactDOM from 'react-dom';
import socketIOClient from 'socket.io-client';
import PropTypes from 'prop-types';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from 'react-router-dom';

import Search from './Search.jsx';
import ChatTabContainer from './containers/ChatTabContainer.jsx';
import ChatWindowContainer from './containers/ChatWindowContainer.jsx';
import '../css/NavBar.css';

export default class NavBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showChatWindow: false,
			member: {}, //person you currently have a chat window open with
		};
		this.dropdown = React.createRef();
	}

	static chatDropdown = false;

	componentDidMount() {
		this.socket = socketIOClient("localhost:3000");
		this.socket.emit("join_solo_room", this.props.userId); //be able to receive notifs when anyone sends you a message
		this.socket.on("message", (message) => {
			if (!this.state.showChatWindow || this.state.member._id !== message.sender) {
				 alert('you have msg');
			}
		});
	}

	signOut = async () => {
		const apiEndpoint = window.ENV.UI_API_AUTH_ENDPOINT;
		try {
			await fetch(`${apiEndpoint}/signout`, {
				method: 'POST',
				credentials: 'include',
			});
			window.location.href = window.ENV.UI_SERVER_ORIGIN; 
		} catch (error) {
			console.log(`Error signing out: ${error}`);
		}		
	}

	getPosts = (groupId) => {
		this.props.updateActiveGroupId(groupId);
		this.props.fetchGroupPosts(this.props.userId, groupId); //huh??
	}

	onScreenClick = (e) => {
		if (!e.target.matches('#chat-tab-span')) {
			this.chatDropdown = false;
			this.dropdown.current.style.display = 'none';
	    	document.getElementById('base').removeChild(document.transparentScreenChat);
		}
	}

	onMessageClick = (member) => {
		this.chatDropdown = false;
		this.dropdown.current.style.display = 'none';
    	document.getElementById('base').removeChild(document.transparentScreenChat);
    	this.setState({ showChatWindow: true, member });
	}

	onToggleChats = () => {
		if (!this.chatDropdown) {
			this.chatDropdown = true;
			this.dropdown.current.style.display = 'inline';
			document.transparentScreenChat = document.createElement("div");
	    	document.transparentScreenChat.className = "transparent-screen-chat";
	    	document.transparentScreenChat.addEventListener('click', this.onScreenClick);
	    	document.getElementById('base').appendChild(document.transparentScreenChat);
	    } else {
	    	this.chatDropdown = false;
	    	this.dropdown.current.style.display = 'none';
	    	document.getElementById('base').removeChild(document.transparentScreenChat);
	    }
	}

	render() {
		const items = this.props.groups.map((group, i) => (
			<NavDropdown.Item key={i} onClick={() => this.getPosts(group._id)}>{group.name}</NavDropdown.Item>
		));
		return (
			<Navbar fixed="top" variant="dark" bg="dark">
				<Navbar.Brand><Link to="/" className="loop_link">Loop</Link></Navbar.Brand>
				<Navbar.Collapse className="justify-content-end">
					<Col sm={3}>
						<Search />
					</Col>

					<span className="chat-toggle" onClick={this.onToggleChats}>Message</span>
					<span id="chat-tab-span" ref={this.dropdown}>
						<ChatTabContainer onMessageClick={this.onMessageClick} />
					</span>

					{this.state.showChatWindow ? 
						ReactDOM.createPortal(<ChatWindowContainer member={this.state.member} />, document.getElementById('contents')) : null}

					<NavDropdown title="Groups" id="basic-nav-dropdown">
						{items}
      				</NavDropdown>
					<Button variant="outline-info" onClick={this.signOut}>Sign out</Button>
				</Navbar.Collapse>
			</Navbar>			
		);
	}
}

NavBar.propTypes = {
	name: PropTypes.string,
	userId: PropTypes.string,
	groups: PropTypes.arrayOf(PropTypes.object),
	fetchGroupPosts: PropTypes.func,
	updateActiveGroupId: PropTypes.func,
};
