import React from 'react';
import PropTypes from 'prop-types';
import autosize from 'autosize';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import '../css/PostForm.css';
import graphQlFetch from './graphQlFetch.js';

export default class PostForm extends React.Component {
	constructor(props) {
		super(props);
		this.textArea = React.createRef();
		this.state = {
			text: '',
			showModal: false,
			disabled: true,
		};
	}

  	onTextChange = (e) => {
  		if (e.target.value) {
  			this.setState({ text: e.target.value, disabled: false });
  		} else {
  			this.setState({ text: e.target.value, disabled: true });
  		}
  	}

  	hideModal = () => {
  		this.setState({ showModal: false, text: '', disabled: true });
  	}

  	openModal = () => {  		
  		this.setState({ showModal: true });
  	}

  	onModalMounting = () => { //fix navbar jumping to the left
  		const navbar = document.getElementsByClassName('navbar')[0];
  		navbar.style.paddingRight = navbar.style.paddingLeft;
  	}

  	onModalMount = () => { //textArea ref not accessible until the modal has finished rendering
  		autosize(this.textArea.current);
  		this.textArea.current.focus();
  	}

  	handleSubmit = async () => {
  		if (this.state.text) {
  			this.setState({ disabled: true });
  			this.props.createPost(this.state.text, this.props.authorId, this.props.groupId);
  			this.hideModal();
  		}
  	}

	render() {
		return (
			<React.Fragment>
				<div className="post-form-container">
					<div className="pic-flex">
						<img src={`https://www.gravatar.com/avatar/${this.props.avatarHash}?d=identicon&s=128`} />
					</div>
					<div className="text-flex" onClick={this.openModal} data-cy="open-post-modal">
						Post Something!
					</div>			
				</div>

				<Modal show={this.state.showModal} onHide={this.hideModal} onEntered={this.onModalMount} onEntering={this.onModalMounting}>
					<Modal.Header bsPrefix="post-form-modal-header modal-header" closeButton>Create Post</Modal.Header>
					<Modal.Body>
						<div>
							<div className="post-form-header">
								<div className="pic-flex">
									<img src={`https://www.gravatar.com/avatar/${this.props.avatarHash}?d=identicon&s=128`} />
								</div>
								<div className="post-form-txt">
									<span>{this.props.name}</span>
								</div>
							</div>
							<textarea 
								ref={this.textArea} placeholder="Post something!" data-cy="post-textarea"
								value={this.state.text} onChange={this.onTextChange} 
							/>
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Button style={{width: "100%"}} variant="primary" disabled={this.state.disabled} onClick={this.handleSubmit} data-cy="post-submit">Submit</Button>
					</Modal.Footer>
				</Modal>
			</React.Fragment>
		);
	}
}

PostForm.propTypes = {
	name: PropTypes.string,
	avatarHash: PropTypes.string,
	authorId: PropTypes.string,
	groupId: PropTypes.string,
	createPost: PropTypes.func,
};