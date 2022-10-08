import React from 'react';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar'

export default class ChatTab extends React.Component {
	render() {
		const members = this.props.members.map((member, i) => (
			<div key={i} onClick={() => this.props.onMessageClick(member)}>
				<table>
					<tbody>
					<tr>
						<td> 
							<img className="profile-pic" src={`https://www.gravatar.com/avatar/${member.avatarHash}?d=identicon&s=128`} />	
						</td>
						<td className='user-info'>
							<div className="user-name">{member.name}</div>
							<div className="date">Sample message</div>
						</td>
					</tr>
					</tbody>
				</table>
			</div>
		));

		return (			
			<div className="chat-tab">
				<div className="chat-tab-header">Message</div>
				{members}
			</div>
		);
	}
}

ChatTab.propTypes = {
	onMessageClick: PropTypes.func,
	members: PropTypes.arrayOf(PropTypes.object)
};