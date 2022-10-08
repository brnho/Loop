import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import parse, { domToReact } from 'html-react-parser';

import graphQlFetch from './graphQlFetch.js';
import '../css/Info.css';

export default class Info extends React.Component {
	state = {
		urls: [],
		showModal: false,
		about: `This is the official Class of 2021 Group for Columbia University in the City of New York, 
			maintained by the Office of Undergraduate Admissions. All members of the Class of 2021 attending 
			Columbia College or The Fu Foundation School of Engineering and Applied Science at Columbia University 
			in the City of New York are invited to join.`,
	}

	componentDidUpdate(prevProps) {
		if (prevProps.members.length === 0 && this.props.members.length > 0) {
			const truncatedMembers = this.props.members.slice(0, 6);
			const urls = truncatedMembers.map((member) => (
				`https://www.gravatar.com/avatar/${member.avatarHash}?d=identicon`
			));
			this.setState({ urls });
		}
	}

	handleClose = () => {
		this.setState({ showModal: false });
	}

	toggleText = () => {
		const dots = document.getElementById("dots");
		const more = document.getElementById("more");
		const hidden = document.getElementById("hidden");
		const less = document.getElementById("less");
		if (more.style.display === "none") {
			dots.style.display = "inline";
			more.style.display = "inline";
			more.innerHTML = "See More";
			hidden.style.display = "none";
			less.style.display = "none";
		} else {
			dots.style.display = "none";
			more.style.display = "none";
			hidden.style.display = "inline";
			less.style.display = "inline";
		}
	}

	render() {
		const images = this.state.urls.map((url, i) => (
			<img key={i} className="info-pics" src={url} />
		));
		let about = this.state.about;
		if (about.length > 150) {
			about = about.slice(0, 150) + '<span id="dots">.... </span><span id="more">See More</span><span id="hidden">'
				+ about.slice(150) + '</span>&nbsp;<span id="less">See Less</span>';
		}
		const options = {
			replace: ({ attribs, children }) => {
				if (!attribs) return;
				if (attribs.id === 'more') {
					return <span id="more" onClick={this.toggleText}>See More</span>;
				}
				if (attribs.id === 'less') {
					return <span id="less" onClick={this.toggleText}>See Less</span>;
				}
			}
		};
		return (
			<React.Fragment>
				<div className="info-container">
					<div className="info-box">
						<div className="info-header clearfix">
							<span className="one">Members</span>
							<span className="two">See All</span>
						</div>
						<div className="clearfix">
							{images}
							<Button variant="primary">+ Invite</Button>
						</div>
						<hr />
						<div className="about">About</div>
						<p style={{marginBottom: 0}}>{parse(about, options)}</p>
					</div>
				</div>

				<Modal show={this.state.showModal} onHide={this.handleClose}>
					<Modal.Body>
						Hello
					</Modal.Body>
				</Modal>
			</React.Fragment>
		);
	}
}

Info.propTypes = {
	members: PropTypes.arrayOf(PropTypes.object)
};

