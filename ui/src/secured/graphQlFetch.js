const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
	if (dateRegex.test(value)) return new Date(value);
	return value;
}

export default async function graphQlFetch(query, variables = {}) {
	const apiEndpoint = window.ENV.UI_API_GRAPHQL_ENDPOINT;
	try {
		const response = await fetch(apiEndpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query, variables })
		});
		const body = await response.text();
		const result = JSON.parse(body, jsonDateReviver);
		if (result.errors) { //error returned by graphql
			const error = result.errors[0];
			console.log(`${error.extensions.code}: ${error.message}`)
		}
		return result.data;
	} catch (e) {
		console.log(`Error in sending data to server: ${e}`); //error with fetching
    	return null;
	}
}