import React from 'react';
import SelectAsync from 'react-select/Async';

import graphQlFetch from './graphQlFetch.js';

export default class Search extends React.Component {
	constructor(props) {
		super(props);
		this.loadOptions = this.loadOptions.bind(this);
	}

	async loadOptions(term) {
		const query = `query events($search: String) {
			events(search: $search) {
				id title description
			}
		}`;
		const data = await graphQlFetch(query, { search: term });
		return data.events.map(event => ({
			label: `${event.title}: ${event.description}`,
			value: event.id,
		}));
	}

	render() {
		const customStyles = {
			option: (styles, state) => ({
				...styles, //styles passed by react-select
				cursor: 'pointer',
			}),
			control: (styles) => ({
				...styles,
				cursor: 'auto',
			}),
		};
		return (
			<SelectAsync
				styles={customStyles}
				instanceId="search-select"
				value=""
				loadOptions={this.loadOptions}
				filterOption={() => true}
				components={{ DropdownIndicator: null }}
			/>
		);
	}
}

