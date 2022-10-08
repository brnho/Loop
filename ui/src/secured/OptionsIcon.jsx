import React from 'react';
import PropTypes from 'prop-types';

import '../css/OptionsIcon.css';

export default class OptionsIcon extends React.Component {
	constructor(props) {
		super(props);
		this.dropdown = React.createRef();
	}

	onScreenClick = (e) => {
		if (!e.target.matches('#dropdown-carat')) {
			this.dropdown.current.style.display = 'none';
	    	document.getElementById('base').removeChild(document.transparentScreen);

		}
	}

	onCaratClick = (e) => {
		e.stopPropagation();
		this.dropdown.current.style.display = 'inline';
		document.transparentScreen = document.createElement("div");
    	document.transparentScreen.className = "transparent-screen";
    	document.transparentScreen.addEventListener('click', this.onScreenClick);
    	document.getElementById('base').appendChild(document.transparentScreen);
	}

	tempClickHandler = (e) => {
		e.stopPropagation();
	}

	onDelete = (e) => {
		this.props.delete(this.props.groupId, this.props.postId, this.props.commentId, this.props.subcommentId); //latter params may be null
		this.dropdown.current.style.display = 'none';
    	document.getElementById('base').removeChild(document.transparentScreen);
	}

	render() {
		let remove, label;
		if (this.props.type === "post") {
			label = "dropdown-post";
		} else if (this.props.type === "comment") {
			label = "dropdown-comment";
		} else {
			label = "dropdown-reply";
		}
		if (this.props.authorId === this.props.userId) {
			if (this.props.type === "post") {
				remove = <div onClick={this.onDelete} data-cy="delete"><i className="far fa-trash-alt"></i>&nbsp;&nbsp;Delete post</div>;
			} else if (this.props.type === "comment") {
				remove = <div onClick={this.onDelete} data-cy="delete"><i className="far fa-trash-alt"></i>&nbsp;&nbsp;Delete comment</div>;
			} else {
				remove = <div onClick={this.onDelete} data-cy="delete"><i className="far fa-trash-alt"></i>&nbsp;&nbsp;Delete reply</div>;
			}
		}
		return (
			<React.Fragment>
				<span className="carat-icon" onClick={this.onCaratClick} data-cy="dropdown"><i className="fas fa-caret-down"></i></span>
				<span 
					id="dropdown-carat" ref={this.dropdown} onClick={this.tempClickHandler} 
					className={label} 
				>
					<div><i className="far fa-bookmark"></i>&nbsp;&nbsp;Bookmark</div>
					{remove}
				</span>
			</React.Fragment>
		);
	}
}

OptionsIcon.propTypes = {
	//passed from a component
	type: PropTypes.string, //either post, comment, or subcomment
	authorId: PropTypes.string, 
	postId: PropTypes.string, 
	commentId: PropTypes.string, //can be null
	subcommentId: PropTypes.string, //can be null

	//passed from redux
	userId: PropTypes.string,
	groupId: PropTypes.string,
	remove: PropTypes.func, //deletePost, deleteComment, or deleteSubcomment
};