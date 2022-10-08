import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import graphQlFetch from './graphQlFetch.js';
import '../css/LikeInfo.css';

export default class LikeInfo extends React.Component {
	state = {
		showModal: false,
		isFetching: false,
		users: [],
	}

	hideModal = () => {
		this.setState({ showModal: false });
	}

	showModal = () => {
		this.setState({ showModal: true });
		this.getLikes();
	}

	onModalMounting = () => { //fix navbar jumping to the left
  		const navbar = document.getElementsByClassName('navbar')[0];
  		navbar.style.paddingRight = navbar.style.paddingLeft;
  	}

  	getLikes = async () => {
  		this.setState({ isFetching: true });
  		const query = `query getPostLikes($groupId: ID!, $postId: ID!) {
	  		getPostLikes(groupId: $groupId, postId: $postId) {
	  			_id name avatarHash
	  		}
		}`;
		const data = await graphQlFetch(query, { groupId: this.props.groupId, postId: this.props.postId });
		if (data && data.getPostLikes) {
			this.setState({ users: data.getPostLikes, isFetching: false });
		} 
  	}

	render() {
		if (this.props.numLikes === 0) {
			return null;
		}
		let likedBy;
		if (this.state.users.length > 0) {
			likedBy = this.state.users.map((user, i) => {
				return (
					<React.Fragment key={i}>
						<div className="likeinfo-box">
							<img className="likeinfo-profile-pic" src={`https://www.gravatar.com/avatar/${user.avatarHash}?d=identicon&s=128`} />	
							<div className="likeinfo-name"><span>{user.name}</span></div>
						</div>
						<hr className="likeinfo-divider" />
					</React.Fragment>
				);
			});
		}
		return (
			<React.Fragment>
				<span onClick={this.showModal} className="show-likes">
					<span className={`mid-dot ${this.props.iconClass}`}>&middot;</span>
					<span className={`num-likes ${this.props.iconClass}`}>{this.props.numLikes}</span>
				</span>
				<Modal show={this.state.showModal} onHide={this.hideModal} onEntering={this.onModalMounting}>
					<Modal.Header bsPrefix="post-form-modal-header modal-header" closeButton>Liked by</Modal.Header>
					<Modal.Body>
						{likedBy}
					</Modal.Body>
				</Modal>
			</React.Fragment>
		);
	}
}

LikeInfo.propTypes = {
	numLikes: PropTypes.number,
	iconClass: PropTypes.string,
	postId: PropTypes.string,
	groupId: PropTypes.string, 
};