const chai = require('chai');
const http = require('chai-http');
const expect = chai.expect;
chai.use(http);

const app = require('../uiserver.js');

describe('App basics', () => {
	it('GET / should return 200', (done) => {
		chai.request(app).get('/')
			.then((res) => {
				expect(res).to.have.status(200);
				done();
			}).catch(err => {
				console.log(err.message);
			});	  
	});
});