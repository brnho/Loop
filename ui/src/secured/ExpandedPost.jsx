import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { LinkContainer } from 'react-router-bootstrap'

import { Post, CommentInput, CommentGroup } from './PostComment.jsx';
import LikeInfo from './LikeInfo.jsx';
import graphQlFetch from './graphQlFetch.js';
import '../css/ExpandedPost.css';

const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
	if (dateRegex.test(value)) return new Date(value);
	return value;
}

export default class ExpandedPost extends React.Component {
	constructor(props) {
		super(props);
		this.textArea = React.createRef();
		this.state = {
			showCommentInput: false,
			flip: false,
			post: {},
			numComments: 0,
			comments: [],
			lastCommentIndex: null,
			viewMore: false,
		};
	}

	componentWillUnmount() {
		this.eventSource.close();
	}

	componentDidMount() {
		this.eventSource = new EventSource(`${window.ENV.UI_API_SSE_ENDPOINT}/expandedPost
			?groupId=${this.props.groupId}&postId=${this.props.match.params.id}`);

		this.eventSource.addEventListener('create_comment_mutation', (e) => {
			const data = JSON.parse(e.data, jsonDateReviver);
			if (!this.state.viewMore) {
				this.setState((state) => ({ 
					comments: state.comments.concat(data.comment),
					numComments: state.numComments + 1,  
				}));
			} else {
				this.setState((state) => ({ numComments: state.numComments + 1 }));
			}
		});

		this.eventSource.addEventListener('create_subcomment_mutation', (e) => {
			const data = JSON.parse(e.data, jsonDateReviver);
			const comments = [...this.state.comments]; 
			const comment = comments.find((comment) => comment._id === data.commentId);
			if (comment && !comment.viewMore) {
				comment.subcomments.push(data.subcomment);
				this.setState((state) => ({
					comments,
					numComments: state.numComments + 1
				}));
			} else {
				this.setState((state) => ({ numComments: state.numComments + 1 }));
			}
		});

		this.eventSource.addEventListener('delete_comment_mutation', (e) => {
			const commentId = JSON.parse(e.data).commentId;
			const length = this.state.comments.length;
			const comments = this.state.comments.filter((comment) => comment._id !== commentId);
			if (comments.length < length) {
				this.setState((state) => ({ comments, numComments: state.numComments - 1 }));
			}
		});

		this.eventSource.addEventListener('delete_subcomment_mutation', (e) => {
			const data = JSON.parse(e.data);
			const comments = [...this.state.comments];
			const comment = comments.find((comment) => comment._id === data.commentId);
			if (comment) {
				const subcomments = comment.subcomments.filter((subcomment) => subcomment._id !== data.subcommentId);
				if (subcomments.length < comment.subcomments.length) {
					comment.subcomments = subcomments;
					this.setState((state) => ({ comments, numComments: state.numComments - 1 }));
				}
			}
		});

		this.eventSource.addEventListener('like_comment_mutation', (e) => {
			const data = JSON.parse(e.data);
			const comments = [...this.state.comments]; 
			const comment = comments.find((comment) => comment._id === data.commentId);
			if (comment) {
				comment.likes.push(data.userId);
				this.setState({ comments });
			}
		});

		this.eventSource.addEventListener('unlike_comment_mutation', (e) => {
			const data = JSON.parse(e.data);
			const comments = [...this.state.comments]; 
			const comment = comments.find((comment) => comment._id === data.commentId);
			if (comment) {
				comment.likes = comment.likes.filter((like) => like !== data.userId);
				this.setState({ comments });
			}
		});

		this.eventSource.addEventListener('like_subcomment_mutation', (e) => {
			const data = JSON.parse(e.data);
			const comments = [...this.state.comments]; 
			const comment = comments.find((comment) => comment._id === data.commentId);
			if (comment) {
				const subcomment = comment.subcomments.find((subcomment) => subcomment._id === data.subcommentId);
				if (subcomment) {
					subcomment.likes.push(data.userId);
					this.setState({ comments });
				}
			}
		});

		this.eventSource.addEventListener('unlike_subcomment_mutation', (e) => {
			const data = JSON.parse(e.data);
			const comments = [...this.state.comments]; 
			const comment = comments.find((comment) => comment._id === data.commentId);
			if (comment) {
				const subcomment = comment.subcomments.find((subcomment) => subcomment._id === data.subcommentId);
				if (subcomment) {
					subcomment.likes = subcomment.likes.filter((like) => like !== data.userId);
					this.setState({ comments });
				}
			}
		});

		this.eventSource.addEventListener('like_post_mutation', (e) => {
			const data = JSON.parse(e.data);
			if (this.props.userId === data.userId) {
				this.setState((state) => ({ numLikes: state.numLikes + 1, userLiked: true }));
			} else {
				this.setState((state) => ({ numLikes: state.numLikes + 1, userLiked: false }));
			}
		});

		this.eventSource.addEventListener('unlike_post_mutation', (e) => {
			const data = JSON.parse(e.data);
			if (this.props.userId === data.userId) {
				this.setState((state) => ({ numLikes: state.numLikes - 1, userLiked: false }));
			} else {
				this.setState((state) => ({ numLikes: state.numLikes - 1 }));
			}
		});

		this.fetchSinglePost();
		this.fetchComments();
	}

	fetchComments = async () => {
		const query = `query singlePost_comments($groupId: ID!, $postId: ID!, $index: Int) {
			singlePost_comments(groupId: $groupId, postId: $postId, index: $index) {
				_id text timestamp likes index 
        		author {
        			_id name avatarHash
        		}
        		subcomments {
    				_id text timestamp likes index
    				author {
    					_id name avatarHash
    				}
        		} 
			}
		}`;
		const data = await graphQlFetch(query, { 
			groupId: this.props.groupId, postId: this.props.match.params.id, index: this.state.lastCommentIndex
		});
		if (data && data.singlePost_comments) {
			const comments = data.singlePost_comments;
			if (comments.length === parseInt(window.ENV.CMT_LIMIT)) {
				this.setState({ 
					lastCommentIndex: comments[comments.length-1].index, 
					viewMore: true 
				});
			} else {
				this.setState({ viewMore: false });
			}
			for (let i = 0; i < comments.length; i++) {
				let length = comments[i].subcomments.length;
				if (length === parseInt(window.ENV.SUBCMT_LIMIT)) {
					comments[i].subcommentIndex = comments[i].subcomments[length-1].index;
					comments[i].viewMore = true;
				} else {
					comments[i].viewMore = false;
				}
			}
			this.setState((state) => {return { comments: state.comments.concat(comments) }});
		} 
	}

	fetchSubcomments = async (commentId, index) => {
		const query = `query singlePost_subcomments($groupId: ID!, $postId: ID!, $commentId: ID!, $index: Int) {
			singlePost_subcomments(groupId: $groupId, postId: $postId, commentId: $commentId, index: $index) {
				_id text timestamp likes index
        		author {
        			_id name avatarHash
        		}
			}
		}`;
		const data = await graphQlFetch(query, { 
			groupId: this.props.groupId, postId: this.props.match.params.id, commentId, index  
		});
		if (data && data.singlePost_subcomments) {
			const subcomments = data.singlePost_subcomments;
			const comments = [...this.state.comments];
			const comment = comments.find((comment) => comment._id === commentId);
			if (subcomments.length === parseInt(window.ENV.SUBCMT_LIMIT)) {
				comment.subcommentIndex = subcomments[subcomments.length-1].index;
				comment.viewMore = true;
			} else {
				comment.viewMore = false;
			}
			comment.subcomments.push(...data.singlePost_subcomments);
			this.setState({ comments });
		}
	}

	fetchSinglePost = async () => {
		const query = `query singlePost_post($userId: ID!, $groupId: ID!, $postId: ID!) {
			singlePost_post(userId: $userId, groupId: $groupId, postId: $postId) {
				_id text timestamp userLiked numLikes numComments
        		author {
        			_id name avatarHash
        		}
			}
		}`;
		const data = await graphQlFetch(query, { userId: this.props.userId, groupId: this.props.groupId, postId: this.props.match.params.id });
		if (data && data.singlePost_post) {
			const post = data.singlePost_post;
			this.setState({ post, numComments: post.numComments, numLikes: post.numLikes, userLiked: post.userLiked });
		} else {
			this.setState({ post: {} });
		}
		//todo: display post dne page if data.singlePost == null
	}

	showCommentInput = () => {
		this.setState((state) => ({ showCommentInput: true, flip: !state.flip }));
	}

	hideCommentInput = () => {
		this.setState({ showCommentInput: false });
	}

	handleCreateComment = (text) => {
		this.props.createComment(text, this.props.userId, this.props.groupId, this.state.post._id);
	}

	render() {
		let post, comments, iconClass, iconAction, likeDot, commentDot, numComments;
		if (Object.keys(this.state.post).length > 0) { //post has been fetched
			post = <Post post={this.state.post} />;
			if (this.state.userLiked) {
				iconClass = 'liked';
				iconAction = () => this.props.unlikePost(this.props.userId, this.props.groupId, this.state.post._id);
			} else {
				iconClass = 'not-liked';
				iconAction = () => this.props.likePost(this.props.userId, this.props.groupId, this.state.post._id);
			}
			if (this.state.numLikes !== 0) {
				likeDot = <span className={`mid-dot ${iconClass}`}>&middot;</span>
			}
		}
		if (this.state.comments.length > 0) {
			comments = this.state.comments.map((comment, i) => (
				<CommentGroup 
					key={i} comment={comment} userId={this.props.userId} groupId={this.props.groupId} postId={this.state.post._id} 
					avatarHash={this.props.avatarHash} createSubcomment={this.props.createSubcomment}
					likeComment={this.props.likeComment}  unlikeComment={this.props.unlikeComment}
					likeSubcomment={this.props.likeSubcomment} unlikeSubcomment={this.props.unlikeSubcomment}
					fetchSubcomments={this.fetchSubcomments}
				/>
			));
			numComments = this.state.numComments;
			if (numComments !== 0) {
				commentDot = <span className={`mid-dot ${iconClass}`}>&middot;</span>
			}
		}
		return (			
			<React.Fragment>
				<div className="expanded-post">
					<div className="expanded-post-header clearfix">
						<LinkContainer to="/">
							<span className="expanded-post-x"><i className="fas fa-times"></i> Close</span>
						</LinkContainer>
					</div>
					{post}
					<hr />
						<span className="commentIcon" onClick={this.showCommentInput}><i className="far fa-comment"></i> Reply</span>
						{commentDot}
						<span className="num-comments">{numComments === 0 ? null : numComments}</span>
						<span className={`likeIcon ${iconClass}`} onClick={iconAction}>
							<i className="far fa-thumbs-up"></i> Like
						</span>
						<LikeInfo numLikes={this.state.numLikes} iconClass={iconClass} postId={this.state.post._id} groupId={this.props.groupId} />
					<hr />
					{comments}
					<div className="view-more" onClick={this.fetchComments}>{this.state.viewMore ? 'View more comments' : null}</div>
					<CommentInput 
						avatarHash={this.props.avatarHash} create={this.handleCreateComment} 
						visible={this.state.showCommentInput} flip={this.state.flip} hide={this.hideCommentInput}
					/>
				</div>
			</React.Fragment>
		);
	}
}

ExpandedPost.propTypes = {
	avatarHash: PropTypes.string,
	name: PropTypes.string,
	userId: PropTypes.string,
	groupId: PropTypes.string,
	createComment: PropTypes.func,
	createSubcomment: PropTypes.func,
	likePost: PropTypes.func,
	unlikePost: PropTypes.func,
	likeComment: PropTypes.func,
	unlikeComment: PropTypes.func,
	likeSubcomment: PropTypes.func,
	unlikeSubcomment: PropTypes.func,
};