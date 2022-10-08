import React from 'react';
import PropTypes from 'prop-types';
import socketIOClient from 'socket.io-client';
import Spinner from 'react-bootstrap/Spinner';
import autosize from 'autosize';

import graphQlFetch from './graphQlFetch.js';
import '../css/ChatWindow.css';

export default class ChatWindow extends React.Component {
	constructor(props) {
		super(props);
		this.textArea = React.createRef();
		this.state = {
			loading: true,
			text: '',
			messages: []
		};
	}

	static convoId;

	fetchConvoId = async () => {
		const query = `query getConvoId($user1Id: ID!, $user2Id: ID!) {
			getConvoId(user1Id: $user1Id, user2Id: $user2Id) {
				_id
			}
		}`;
		const data = await graphQlFetch(query, { user1Id: this.props.userId, user2Id: this.props.member._id });
		if (data && data.getConvoId) {
			this.convoId = data.getConvoId._id;
		}//else: throw some error
	}
	
	async componentDidMount() {
		autosize(this.textArea.current);

		await this.fetchConvoId();		

		this.socket = socketIOClient("localhost:3000");

		this.socket.emit('join_shared_room', this.convoId);

		this.socket.on('message_history', (messages) => {
			this.setState({ messages, loading: false });
		});

		this.socket.on('message', (message) => {
			const messages = this.state.messages.concat(message);
			this.setState({ messages });
		});
	}

	async componentDidUpdate(prevProps) {
		if (prevProps.member._id !== this.props.member._id) { //switched chat windows to a different user
			this.setState({ loading: true });
			await this.fetchConvoId();
			this.socket.emit('join_shared_room', this.convoId);
		}
	}

	onEnterPress = (e) => {
		if(e.keyCode == 13 && e.shiftKey == false && this.state.text.trim()) {
			e.preventDefault();
			const message = { convoId: this.convoId, timestamp: Date.now(), sender: this.props.userId, msg: this.state.text }; 
			this.socket.emit('message', { soloRoom: this.props.member._id, sharedRoom: this.convoId, message });
			this.setState({ text: '' });
		}
	}

	onTextChange = (e) => {
		this.setState({ text: e.target.value });
	}

	render() {
		const spinner = <Spinner animation="border" role="status"><span className="sr-only">Loading...</span></Spinner>;
		let time;
		const messages = this.state.messages.map((message, i) => {
			let displayImage, displayTime;
			if (i === 0 || ((parseInt(message.timestamp) - parseInt(time)) / 1000) > 43200) {
				time = message.timestamp;
				displayTime = true;
			} else {
				displayTime = false;
			}
			const timeDivider = displayTime ? <div className="time-divider">{(new Date(time)).toDateString()}</div> : null;
			const style = message.sender === this.props.userId ? "self" : "other";
			if (style === "other") {
				if (i === this.state.messages.length - 1 || this.state.messages[i+1].sender === this.props.userId) {
					displayImage = "visible";
				} else {
					displayImage = "hidden";
				}
			} else {
				displayImage = "hidden";
			}
			return (
				<React.Fragment key={i}>
					{timeDivider}
					<div className={`msg-wrapper clearfix ${style}`}>
						<div className={`msg-pic-wrapper ${style}`}>
							<img className={`msg-pic ${displayImage}`} src={`https://www.gravatar.com/avatar/${this.props.member.avatarHash}?d=identicon&s=32`} />
						</div>
						<div className={`msg ${style}`}>{message.msg}</div>
					</div>
				</React.Fragment>
			);
		});
		return (			
			<div className="chat-window">
				<div className="chat-header">
					<img className="profile-pic" src={`https://www.gravatar.com/avatar/${this.props.member.avatarHash}?d=identicon&s=32`} />
					&nbsp;{this.props.member.name}
				</div>
				<hr />
				<div className="chat-body">{!this.state.loading ? messages : spinner}</div>
				<div className="chat-footer"> 
					<textarea 
						ref={this.textArea} className="chat-input" placeholder="Send a message" onChange={this.onTextChange} 
						onKeyDown={this.onEnterPress} value={this.state.text} rows={1}
					/>
				</div>
			</div>
		);
	}
}

ChatWindow.propTypes = {
	name: PropTypes.string,
	userId: PropTypes.string,
	avatarHash: PropTypes.string,

	member: PropTypes.object, //{ _id, name, avatarhash }
};
