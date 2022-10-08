import React from 'react';
import Col from 'react-bootstrap/Col';
import { LinkContainer } from 'react-router-bootstrap';
import autosize from 'autosize';
import TimeAgo from 'react-timeago';
const moment = require('moment');

import PostOptionsIconContainer from './containers/PostOptionsIconContainer.jsx';
import CommentOptionsIconContainer from './containers/CommentOptionsIconContainer.jsx';
import SubcommentOptionsIconContainer from './containers/SubcommentOptionsIconContainer.jsx';
import LikeInfo from './LikeInfo.jsx';
import '../css/PostComment.css';
import '../css/ExpandedPost.css';

//props: avatarHash, create (createComment OR createSubcomment), visible, flip, hide (func)
class CommentInput extends React.Component {
	constructor(props) {
		super(props);
		this.textArea = React.createRef();
		this.state = {
			text: ''
		};
	}

	onEnterPress = (e) => {
		if(e.keyCode == 13 && e.shiftKey == false && this.state.text.trim()) {
			e.preventDefault();
			this.props.create(this.state.text); 
			this.setState({ text: '' }, () => autosize.update(this.textArea.current));
		}
	}

	onTextChange = (e) => {
		this.setState({ text: e.target.value });
	}

	componentDidUpdate(prevProps) {
		if (prevProps.flip !== this.props.flip) { //user clicked on reply
			autosize(this.textArea.current);
			this.textArea.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
			this.textArea.current.focus({ preventScroll: true });
		}
	}

	onBlur = (e) => {
		if (this.state.text.trim() == '') {
			this.props.hide();
		}
	}

	render() {
		if (!this.props.visible) return null;
		return (
			<div className="cmt-container">
				<div className="cmt-pic">
					<img className="cmt-profile-pic" src={`https://www.gravatar.com/avatar/${this.props.avatarHash}?d=identicon&s=128`} />	
				</div>
				<textarea 
					className="cmt-textarea" ref={this.textArea} placeholder="Write a comment" onBlur={this.onBlur}
					rows={1} onKeyDown={this.onEnterPress} value={this.state.text} onChange={this.onTextChange}
				/>
			</div>
		);
	}
}

//prop strings: comment, userId, groupId, postId, commentId, subcommentId (may be null)
//prop functions: like, unlike, openCommentInput
function Comment(props) {
	const { text, timestamp, author: { _id: authorId, name, avatarHash }, likes } = props.comment;
	const { comment, userId, groupId, postId, commentId, subcommentId } = props;
	
	const numLikes = likes.length;
	let iconClass, iconAction, likeDot, icon, numLikesSpan;
	if (likes.includes(userId)) {
		iconClass = 'liked';
		iconAction = () => props.unlike(userId, groupId, postId, commentId, subcommentId); 
	} else {
		iconClass = 'not-liked';
		iconAction = () => props.like(userId, groupId, postId, commentId, subcommentId); 
	}
	if (numLikes !== 0) {
		likeDot = <span className="mid-dot">&middot;</span>;
		numLikesSpan = <span className={`num-likes ${iconClass}`}>{numLikes}</span>;
	}
	if (subcommentId) {
		icon = (
			<SubcommentOptionsIconContainer 
				type="subcomment" authorId={authorId} postId={postId} commentId={commentId} subcommentId={subcommentId}  
			/>
		);
	} else {
		icon = <CommentOptionsIconContainer type="comment" authorId={authorId} postId={postId} commentId={commentId} />;
	}
	return (
		<div className="cmt-container">
			<div className="cmt-pic">
				<img className="cmt-profile-pic" src={`https://www.gravatar.com/avatar/${avatarHash}?d=identicon&s=128`} />	
			</div>
			<div>
				<div className="cmt-text">
					<span className="cmt-name">{name}</span> 
					&nbsp;{text}
				</div>
				<div className="cmt-options">
					<span className={`cmt likeIcon ${iconClass}`} onClick={iconAction}>Like</span>
					{likeDot}
					{numLikesSpan}
					<span className="commentIcon" onClick={props.openCommentInput}>Reply</span>
					<span className="cmt-time"><TimeAgo date={timestamp} minPeriod={30} formatter={cmtDateFormatter}/></span>
					{icon}
				</div>
			</div>
		</div>
	);
}

//prop strings: userId, groupId, postId, avatarHash, comment
//prop functions: createSubcomment, likeComment, unlikeComment, likeSubcomment, unlikeSubcomment, fetchSubcomments
class CommentGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state ={
			showCommentInput: false,
			flip: false,
		};
	}
	
	handleCreateSubcomment = (text) => {
		this.props.createSubcomment(text, this.props.userId, this.props.groupId, this.props.postId, this.props.comment._id);
	}

	openCommentInput = () => { 
		this.setState((state) => ({ showCommentInput: true, flip: !state.flip })); 
	};

	hideCommentInput = () => {
		this.setState({ showCommentInput: false });
	}

	render() {
		const { userId, groupId, postId, avatarHash, comment } = this.props;
		const { likeComment, unlikeComment, likeSubcomment, unlikeSubcomment, fetchSubcomments } = this.props;
		const subcomments = comment.subcomments.map((subcomment, i) => (
			<Comment 
				key={i} comment={subcomment} userId={userId} groupId={groupId} postId={postId} openCommentInput={this.openCommentInput}
				commentId={comment._id} subcommentId={subcomment._id} like={likeSubcomment} unlike={unlikeSubcomment}
			/>
		));
		let viewMore;
		if (comment.viewMore) {
			viewMore = (
				<div className="view-more reply" onClick={() => { fetchSubcomments(comment._id, comment.subcommentIndex) }}>
					<i className="fas fa-reply"></i> View more replies
				</div>
			);
		}
		return (
			<React.Fragment>
				<Comment 
					comment={comment} userId={userId} groupId={groupId} postId={postId} 
					commentId={comment._id} like={likeComment} unlike={unlikeComment} openCommentInput={this.openCommentInput}
				/>
				<div className="subcomments-container">
					{subcomments}
					{viewMore}
					<CommentInput 
						avatarHash={avatarHash} create={this.handleCreateSubcomment} 
						visible={this.state.showCommentInput} flip={this.state.flip} hide={this.hideCommentInput}
					/>
				</div>
			</React.Fragment>
		);
	}
}

function cmtDateFormatter(value, unit, suffix, epochSeconds, nextFormatter) {
	if (value === 0 && unit === 'second') {
		return 'just now';
	} else {
		return value + unit.slice(0, 1).toLowerCase();
	}
}

function postDateFormatter(value, unit, suffix, epochSeconds, nextFormatter) {
	if (['day', 'week', 'month'].includes(unit)) {
		return moment(new Date(epochSeconds)).format('MMMM D [at] h:mma'); 
	} else if (unit === 'year') {
		return moment(new Date(epochSeconds)).format('MMMM D, YYYY'); 
	} else if (value < 20 && unit === 'second') {
		return 'just now';
	} else {
		return nextFormatter();
	}
}
//"March 29 2020 10:30"
function Post(props) {
	const { _id: postId, text, timestamp, author: { _id: authorId, name, avatarHash } } = props.post;
	return (
		<React.Fragment>
			<table>
				<tbody>
				<tr>
					<td> 
						<img className="profile-pic" src={`https://www.gravatar.com/avatar/${avatarHash}?d=identicon&s=128`} />	
					</td>
					<td className='user-info'>
						<div className="user-name">{name}</div>
						<div className="date"><TimeAgo date={timestamp} minPeriod={30} formatter={postDateFormatter}/></div>
					</td>
				</tr>
				</tbody>
			</table>
			<span className="post-options-icon"><PostOptionsIconContainer authorId={authorId} postId={postId} type="post" /></span>
			<div data-cy="post-text">{text}</div>	
		</React.Fragment>
	);
}

class PostComment extends React.Component {
	render() {
		const post = this.props.post;
		let iconClass, iconAction, likeDot, commentDot;
		if (post.userLiked) {
			iconClass = 'liked';
			iconAction = () => this.props.unlikePost(post._id);
		} else {
			iconClass = 'not-liked';
			iconAction = () => this.props.likePost(post._id);
		}
		if (post.numComments !== 0) {
			commentDot = <span className="mid-dot">&middot;</span>
		}
		return (
			<React.Fragment>
				<LinkContainer to={`/post/${post._id}`}>
					<div className="post" data-cy="post">
						<Post post={post} />
						<hr />
						<span onClick={(e) => e.stopPropagation()}>
							<span className="commentIcon"><i className="far fa-comment"></i> Reply</span>
							{commentDot}
							<span className="num-comments">{post.numComments === 0 ? null : post.numComments}</span>
							<span className={`likeIcon ${iconClass}`} onClick={iconAction}>
								<i className="far fa-thumbs-up"></i> Like 
							</span>
							<LikeInfo numLikes={post.numLikes} iconClass={iconClass} postId={post._id} groupId={this.props.groupId} />
						</span>
					</div>
				</LinkContainer>
			</React.Fragment>
		);
	}
}

export { PostComment, Post, Comment, CommentInput, CommentGroup };

