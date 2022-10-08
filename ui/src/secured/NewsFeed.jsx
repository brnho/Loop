import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { Route, Switch } from 'react-router-dom';
//import getScrollbarWidth from 'get-scrollbar-width';

import PostFormContainer from './containers/PostFormContainer.jsx';
import { PostComment } from './PostComment.jsx';
import InfoContainer from './containers/InfoContainer.jsx';
import ExpandedPostContainer from './containers/ExpandedPostContainer.jsx';
import '../css/NewsFeed.css';

const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
	if (dateRegex.test(value)) return new Date(value);
	return value;
}

export default class NewsFeed extends React.Component {
	componentWillUnmount() {
		this.eventSource.close();
	}

	componentDidMount() {
		if (this.props.userId) {
			const params = new URLSearchParams(this.props.location.search);
			const groupId = params.get('groupId');
			this.onGroupChange(groupId);
		}
	}

	componentDidUpdate(prevProps) {
		const oldParams = new URLSearchParams(prevProps.location.search);
		const newParams = new URLSearchParams(this.props.location.search);
		if (oldParams.get('groupId') !== newParams.get('groupId') || (!prevProps.userId && this.props.userId)) {
			this.onGroupChange(newParams.get('groupId'));
		}
	}

	//need a not found page

	onGroupChange = (groupId) => {
		if (!groupId) return;

		this.eventSource ? this.eventSource.close() : null;
		this.eventSource = new EventSource(`${window.ENV.UI_API_SSE_ENDPOINT}?groupId=${groupId}`);

		this.eventSource.addEventListener('create_post_mutation', (e) => {
			const post = JSON.parse(e.data, jsonDateReviver).post;
			post.numLikes = 0;
			post.numComments = 0;
			post.userLiked = false;
			this.props.updateSinglePost(post);
		});

		this.eventSource.addEventListener('delete_post_mutation', (e) => {
			this.props.deleteSinglePost(e.data); //e.data = postId
		});
		
		this.eventSource.addEventListener('stat_mutation', (e) => {
			this.props.fetchPostStats(this.props.userId, groupId, e.data);
		});

		this.props.fetchGroupPosts(this.props.userId, groupId);
	}

	/*showPost = (post) => {
		this.setState({ showPost: true, activePost: post });
		//document.documentElement.style.overflowY = "hidden";
		//document.documentElement.style.paddingRight = `${getScrollbarWidth()}px`;
	}*/

	/*modalExiting = () => {
		document.documentElement.style.overflowY = "auto";
	}*/

	handleLikePost = (postId) => {
		this.props.likePost(this.props.userId, this.props.groupId, postId);
	}

	handleUnlikePost = (postId) => {
		this.props.unlikePost(this.props.userId, this.props.groupId, postId);
	}

	viewMore = () => {
		this.props.fetchGroupPosts(this.props.userId, this.props.groupId, this.props.postIndex);
	}

	render() {
		if (this.props.error) {
			return <h1>Not found!!!</h1>;
		}
		if (this.props.isFetching) {
			//todo: properly position the spinner
			return (<Spinner animation="border" role="status"><span className="sr-only">Loading...</span></Spinner>);
		}
		const viewMore = this.props.postIndex !== -1 ? <div className="view-more-newsfeed" onClick={this.viewMore}>View more</div> : null;
		return (
			<div className="top-container" id="base">
				<Container fluid={true}>
					<Row>
						<Col md={{ span: 4, offset: 4 }} data-cy="newsfeed">
							<Switch>
								<Route exact path="/post/:id" component={ExpandedPostContainer} />
								<Route path="/" render={(props) => {
									const postComments = this.props.posts.map((post, i) => (
										<PostComment 
											key={i} post={post} showPost={this.showPost} groupId={this.props.groupId}
											likePost={this.handleLikePost} unlikePost={this.handleUnlikePost} 
										/>
									));
									return (
										<React.Fragment>
											<PostFormContainer />
											{postComments}
											{viewMore}
										</React.Fragment>
									);
								}} />
							</Switch>
						</Col>
						<Col md={{ span: 4 }}>
							<InfoContainer />							
						</Col>
					</Row>
				</Container>
			</div>

		);
	}
}

NewsFeed.propTypes = {
	posts: PropTypes.arrayOf(PropTypes.object),
	postIndex: PropTypes.number,
	isFetching: PropTypes.bool,
	error: PropTypes.bool,
	avatarHash: PropTypes.string,
	name: PropTypes.string,
	userId: PropTypes.string,
	groupId: PropTypes.string,

	fetchGroupPosts: PropTypes.func,
	updateActiveGroupId: PropTypes.func,
	likePost: PropTypes.func,
	unlikePost: PropTypes.func,
	fetchPostStats: PropTypes.func,
	updateSinglePost: PropTypes.func,
	deleteSinglePost: PropTypes.func,
};
